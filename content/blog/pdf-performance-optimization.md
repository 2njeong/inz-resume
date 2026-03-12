---
title: "@react-pdf/renderer PDF 생성 성능 최적화 — 이미지 Prefetch와 Web Worker 텍스트 측정"
date: "2026-03-09"
tags: ["Performance", "Web Worker", "React", "PDF"]
---

## 배경

병원 건강검진 관리 플랫폼에서 **검진 결과 PDF 리포트**를 브라우저에서 동적으로 생성하는 기능을 담당하고 있다. 환자의 검진 결과, 의사 소견, 첨부 이미지, 심전도(ECG) 등이 포함된 다국어(한/영/베트남어) PDF를 `@react-pdf/renderer`로 생성한다.

이 PDF 생성 기능은 단순히 데이터를 렌더링하는 수준이 아니다. **A4 페이지 높이에 맞게 테이블·텍스트·이미지를 자동으로 분할**해야 하고, 이를 위해 렌더링 전에 모든 요소의 높이를 사전 계산해야 한다. Canvas API로 텍스트 너비를 측정하고, 줄 수를 계산하고, 남은 공간에 맞춰 행 단위·줄 단위로 콘텐츠를 나눈다.

기능 자체는 잘 동작했지만, **실 사용 환경에서 두 가지 문제**가 드러났다.

---

## 문제 정의

### 문제 1: PDF 다운로드 버튼을 누르면 한참을 기다려야 한다

PDF 생성 과정에서 가장 시간을 잡아먹는 구간은 **이미지 다운로드**였다. 검진 결과에는 X-ray, 초음파, 심전도 등 다수의 첨부 이미지가 포함되는데, 다운로드 버튼을 누른 시점에 비로소 이미지를 fetch하기 시작한다.

```
[AS-IS 흐름]

리포트 상세 페이지 진입
    ↓
(사용자가 결과를 확인하는 동안 — 유휴 시간)
    ↓
PDF 다운로드 버튼 클릭
    ↓
이미지 10장 다운로드 시작 ← 여기서 수 초 소요
    ↓
데이터 변환 + PDF 렌더링
    ↓
다운로드 완료
```

사용자가 리포트 페이지에서 결과를 확인하는 동안 **아무런 사전 작업 없이 유휴 상태**로 대기하고, 다운로드 요청이 들어와서야 모든 네트워크 요청이 시작되는 구조였다.

### 문제 2: PDF 생성 중 UI가 멈춘다

페이지 분할을 위한 텍스트 높이 계산은 **Canvas API 기반의 동기 작업**이다. `measureTextHeight`가 호출될 때마다 아래 과정이 반복된다:

```typescript
// 호출할 때마다 Canvas를 새로 생성
const canvas = document.createElement('canvas');
canvas.width = 595;  // A4 너비
canvas.height = 842; // A4 높이
const ctx = canvas.getContext('2d');

// 폰트 설정 후 단어 단위로 줄바꿈 계산
ctx.font = '9px "Pretendard Variable", ...';
const metrics = ctx.measureText(testLine);
```

검진 항목이 30개 이상인 패키지의 경우, 이 함수가 **수백 회 호출**된다. 매 호출마다 Canvas 엘리먼트를 생성하고, 2D 컨텍스트를 초기화하고, 텍스트를 측정한다. 이 모든 작업이 **메인 스레드에서 동기적으로 실행**되기 때문에, 그 동안 UI는 응답하지 않는다.

---

## 해결

### 해결 1: 이미지 Prefetch — 유휴 시간 활용

핵심 아이디어는 단순하다. **사용자가 리포트를 읽는 시간을 활용해 이미지를 미리 받아두자.**

기존 코드에는 이미 `imageDownloadCache`라는 `Map<URL, Promise<dataURL>>` 캐시가 있었다. 이 캐시를 **페이지 진입 시점에 미리 채워넣는 방식**으로 활용했다.

```typescript
// usePrefetchPdfImages.ts
const usePrefetchPdfImages = ({ checkupScheduleId }) => {
  const { data: report } = useCheckupReport({ checkupScheduleId });

  useEffect(() => {
    if (!report?.checkupRecord?.checkupSections) return;
    prefetchReportImages(report.checkupRecord.checkupSections);
  }, [report]);
};
```

`imageDownloadCache`에 **Promise 자체를 저장**하기 때문에, prefetch가 아직 진행 중인 상태에서 PDF 다운로드가 시작되어도 동일한 Promise를 await한다. 중복 요청이 발생하지 않는다.

```
[TO-BE 흐름]

리포트 상세 페이지 진입
    ↓
usePrefetchPdfImages 실행 → 백그라운드 이미지 다운로드 시작
    ↓
(사용자가 결과를 확인하는 동안 — 이미지 다운로드 완료)
    ↓
PDF 다운로드 버튼 클릭
    ↓
캐시 히트 → 이미지 즉시 사용
    ↓
다운로드 완료
```

### 해결 2: Web Worker 텍스트 측정 — 메인 스레드 해방

텍스트 높이 측정을 Web Worker로 분리하되, 기존의 **동기적 호출 인터페이스는 유지**해야 했다. `measureTextHeight`는 페이지 분할 로직 곳곳에서 동기적으로 호출되고 있었고, 이를 전부 async로 바꾸면 변경 범위가 너무 커진다.

접근 방식: **PDF 렌더링 전에 Worker에서 모든 텍스트를 배치 측정하고, 결과를 캐시에 저장한다. 렌더링 중 `measureTextHeight` 호출 시 캐시에서 즉시 반환한다.**

```typescript
// textMeasurement.worker.ts
const loadFont = async () => {
  const font = new FontFace('Pretendard Variable', 'url(/fonts/...)');
  await font.load();
  self.fonts.add(font);
};

self.onmessage = async (e) => {
  await loadFont();
  const canvas = new OffscreenCanvas(595, 842);
  const ctx = canvas.getContext('2d');

  // Canvas 1개를 재사용하며 배치 측정
  const results = e.data.items.map((item) => ({
    key: item.key,
    height: measureTextInWorker(ctx, item.text, item.maxWidth, ...),
  }));

  self.postMessage({ results });
};
```

`measureTextHeight`에 캐시 레이어를 추가:

```typescript
const measurementCache = new Map<string, number>();

export const measureTextHeight = (text, maxWidth, fontSize, lineHeight) => {
  const cacheKey = `${text}|${maxWidth}|${fontSize}|${lineHeight}`;

  // 캐시 히트 → Canvas 생성 없이 즉시 반환
  const cached = measurementCache.get(cacheKey);
  if (cached !== undefined) return cached;

  // 캐시 미스 → 기존 Canvas 측정 로직 (fallback)
  const height = measureWithCanvas(text, maxWidth, fontSize, lineHeight);
  measurementCache.set(cacheKey, height);
  return height;
};
```

```
[AS-IS]
measureTextHeight #1 → Canvas 생성 → 측정 → 반환 (메인 스레드)
measureTextHeight #2 → Canvas 생성 → 측정 → 반환 (메인 스레드)
... (수백 회 반복, 메인 스레드 블로킹)

[TO-BE]
Worker: Canvas 1개 생성 → 전체 배치 측정 → 캐시 저장 (백그라운드)
measureTextHeight #1 → 캐시 히트 → 즉시 반환
measureTextHeight #2 → 캐시 히트 → 즉시 반환
... (메인 스레드 블로킹 없음)
```

---

## 설계 원칙: Graceful Fallback

두 최적화 모두 **실패해도 기능이 깨지지 않는 구조**로 설계했다.

| 실패 시나리오 | Fallback 동작 |
|---|---|
| Prefetch 네트워크 실패 | 캐시에서 제거, PDF 생성 시 재시도 |
| Worker 생성 실패 (구 브라우저) | `resolve()`로 즉시 반환, 기존 동기 측정 실행 |
| OffscreenCanvas 미지원 | Worker 내부에서 fallback 높이 계산 |
| 폰트 로딩 실패 | 시스템 폰트로 측정 (정확도 소폭 감소) |

최적화는 성공하면 더 빨라지고, 실패하면 기존과 동일하게 동작한다.

---

## 결과

- Canvas 생성 횟수: **수백 회 → 1회** (Worker 내 재사용)
- 텍스트 측정이 **메인 스레드에서 완전히 분리** → UI 응답성 유지
- 이미지 로딩 대기 시간 제거 (유휴 시간 활용)
- 기존 코드 변경 최소화: `measureTextHeight` 시그니처 유지, 캐시 한 줄 추가

---

## 회고

이번 최적화에서 가장 중요하게 생각한 건 **"기존 코드를 최소한으로 건드리면서 성능을 개선한다"**였다.

`measureTextHeight`의 동기적 인터페이스를 async로 바꾸면 더 깔끔했을 수 있지만, 그러면 이 함수를 호출하는 여러 모듈까지 전부 수정해야 한다. 대신 **"사전 계산 + 캐시"라는 레이어를 기존 코드 위에 얹는 방식**을 택했다.

**"최소 변경, 최대 효과, 실패해도 안전"** — 프로덕션 코드에서 성능 최적화를 할 때 가장 중요한 원칙이라고 생각한다.
