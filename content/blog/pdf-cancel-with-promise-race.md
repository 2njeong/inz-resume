---
title: "React PDF 다운로드 취소 기능 구현하기: Promise.race와 AbortController의 활용"
date: "2025-08-20"
tags: ["React", "Async", "AbortController", "Troubleshooting"]
---

## 문제 상황

`@react-pdf/renderer`로 PDF를 생성하는 기능에서, 사용자가 취소 버튼을 눌러도 PDF 생성이 완료될 때까지 기다려야 하는 문제가 있었다.

```typescript
const downloadPdf = async () => {
  const blob = await generatePdfBlob(); // 5-10초 소요
  // 사용자가 취소 버튼을 눌러도... 계속 기다려야 함
  downloadFile(blob);
};
```

- 긴 대기 시간으로 인한 나쁜 사용자 경험
- 불필요한 리소스 낭비 (네트워크, CPU)

---

## 첫 번째 시도: useState로 취소 플래그 관리

```typescript
const [isCancelled, setIsCancelled] = useState(false);

const generatePdfBlob = async () => {
  if (isCancelled) return;
  const data = await fetchData();
  if (isCancelled) return;
  const pdfBlob = await pdf().toBlob(); // 여전히 중단 불가능!
  return pdfBlob;
};
```

**한계점:**
- `toBlob()` 메서드는 중단할 수 없음
- 각 단계마다 체크해야 하는 번거로움
- 린터 경고: "Unnecessary conditional, value is always falsy"

---

## 두 번째 시도: useRef로 개선

```typescript
const isCancelledRef = useRef(false);
// 여전히 동일한 문제...
if (isCancelledRef.current) return;
```

근본적인 해결책이 아님. PDF 생성 자체는 여전히 중단 불가능.

---

## 핵심 깨달음: "물리적 중단 vs 논리적 중단"

> "정말 모든 작업을 물리적으로 중단해야 할까? 아니면 사용자 경험을 우선시해야 할까?"

- **기술적 완벽함**: 모든 작업을 물리적으로 중단
- **사용자 경험**: 빠른 피드백과 UI 응답성

두 가지를 조합하는 방향으로 전환했다.

---

## 최종 해결책: Promise.race + AbortController

### 1. Promise.race를 활용한 논리적 취소

```typescript
const result = await Promise.race([
  generatePdfBlob(language, signal),    // 실제 PDF 생성
  new Promise((_, reject) => {          // 취소 신호 대기
    signal.addEventListener('abort', () => {
      reject(new Error('CANCELLED'));
    });
  })
]);
```

**Promise.race의 핵심:** 여러 Promise 중 가장 먼저 완료되는 것의 결과를 반환한다. 취소 신호가 먼저 오면 즉시 "취소됨" 처리. PDF 생성은 백그라운드에서 계속되지만 결과는 무시.

### 2. AbortController로 네트워크 요청 물리적 중단

```typescript
export const downloadPdfFromUrl = async (
  attachment: Attachment,
  signal: AbortSignal
): Promise<Blob> => {
  const response = await pdfDownloadAxios.get<Blob>(url, { signal });
  return response.data;
};
```

### 3. 전체 아키텍처

```typescript
const downloadPdfMutation = useMutation({
  mutationFn: async () => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const result = await Promise.race([
      generatePdfBlob(language, signal),
      new Promise((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new Error('CANCELLED'));
        });
      }),
    ]);

    if (signal.aborted) throw new Error('CANCELLED');

    const blob = result as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName}_checkup_report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  onError: (error) => {
    if (error.message === 'CANCELLED') return;
    toast.error(t('PDF 다운로드에 실패했습니다'));
  },
});

const cancelDownload = () => {
  abortControllerRef.current?.abort();
};
```

---

## Promise.race가 정말 필요할까?

개발 중 의문이 생겼다. 단순히 `signal.abort()` 호출만으로도 충분하지 않을까?

### Promise.race 없이

```typescript
const downloadPdf = async () => {
  try {
    const blob = await generatePdfBlob(language, signal);
    // generatePdfBlob이 toBlob()에서 3초 걸린다면?
    // 사용자가 1초째에 취소해도 3초를 기다려야 함
    downloadFile(blob);
  } catch (error) {
    toast.info('취소됨'); // ← 3초 후에야 실행
  }
};
```

### Promise.race 사용 시

```typescript
const downloadPdf = async () => {
  try {
    const result = await Promise.race([
      generatePdfBlob(signal),        // 3초 걸림
      new Promise((_, reject) => {    // 1초째에 즉시 완료!
        signal.addEventListener('abort', () => {
          reject(new Error('CANCELLED'));
        });
      })
    ]);
    downloadFile(result);
  } catch (error) {
    toast.info('취소됨'); // ← 1초째에 즉시 실행!
  }
};
```

사용자 입장에서의 차이:
- **Without**: 취소 클릭 → ... (3초 대기) → "취소됨"
- **With**: 취소 클릭 → "취소됨" (즉시!)

---

## 결과 및 효과

| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 사용자 취소 피드백 | 5초 후 | 즉시 |
| 네트워크 요청 | 취소 불가 | 물리적 중단 |
| 파일 다운로드 | 취소해도 실행 | 취소 시 미실행 |

---

## 핵심 학습 포인트

**1. Promise.race의 진정한 활용법**

```typescript
// 단순히 "빠른 것을 선택"이 아니라
// "사용자 경험을 위한 논리적 제어"로 활용
Promise.race([actualWork(), userCancelSignal()])
```

**2. AbortController 생태계** — fetch, axios(v0.22.0+) 모두 네이티브 지원

**3. 완벽한 물리적 중단이 불가능할 때**, 논리적 중단으로 사용자 경험을 우선시하는 것도 유효한 전략이다.
