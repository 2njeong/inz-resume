---
title: "react-pdf 이미지 로딩부터 S3 CORS까지 — 프로덕션 트러블슈팅 기록"
date: "2025-08-06"
tags: ["CORS", "AWS", "React", "Troubleshooting"]
---

## 시작: 이미지가 안 나온다

`@react-pdf/renderer`에서 `<Image src={s3Url} />`로 이미지를 넣었는데, PDF에 이미지가 로드되지 않았다.

원인을 추적하면서 **여러 겹의 문제**가 있다는 걸 알게 되었다.

---

## Layer 1: Node.js 환경 제한

react-pdf/renderer는 내부적으로 Node.js 환경에서 동작하는 부분이 있어서 일반적인 브라우저 API와 다른 제약이 있다:

- **파일 시스템 접근 제한**: 브라우저에서는 로컬 파일에 직접 접근 불가
- **외부 URL 제한**: CORS 정책에 의해 외부 이미지 직접 사용 제한
- **Import 제한**: 동적 이미지 경로를 static import처럼 사용 불가

**해결: Base64 인코딩**

이미지를 Base64 Data URL로 변환하면 네트워크 요청 없이 PDF에 포함할 수 있다:

```typescript
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

// 사용
const response = await fetch(imageUrl);
const blob = await response.blob();
const dataUrl = await blobToDataURL(blob);
// dataUrl = "data:image/png;base64,iVBOR..." → PDF에서 바로 사용 가능
```

---

## Layer 2: S3 CORS 에러 — 그런데 첫 번째 요청은 성공?

Base64 변환을 적용했는데, **첫 번째 요청은 성공하고 두 번째 요청에서 CORS 에러**가 발생했다.

### 원인: 브라우저 캐시 간섭

1. 첫 요청: `<img src={url}>` → 브라우저가 이미지를 캐시 (CORS 헤더 없이)
2. 두 번째 요청: `fetch(url)` → 브라우저가 캐시된 응답을 반환
3. 캐시된 응답에 `Access-Control-Allow-Origin` 헤더가 없음 → CORS 에러

### 해결: Cache-busting + CORS fallback

```typescript
// 1차: 직접 fetch
try {
  const response = await fetch(url);
  const blob = await response.blob();
  return await blobToDataURL(blob);
} catch {
  // 2차: Lambda 프록시를 통한 fallback
  return await convertImageToBase64({ url, useLambdaProxy: true });
}
```

---

## Layer 3: CloudFront + S3 CORS 정책 체인

S3에 CORS 설정을 했는데도 CloudFront를 통해 접근하면 CORS 에러가 발생했다.

**이유**: CloudFront가 S3의 CORS 응답 헤더를 캐시하지 않거나, Origin 헤더를 S3로 전달하지 않아서 발생.

### 해결 전략들

**1. 같은 도메인에서 서빙 (CNAME)**
```
app.example.com → CloudFront → S3
images.example.com → 같은 CloudFront
```
같은 Origin이면 CORS 자체가 불필요.

**2. 내부 프록시 서버**
```
브라우저 → 내 서버(프록시) → S3
```
서버 간 통신에는 CORS가 없으므로 우회 가능.

**3. Lambda 프록시 (최종 채택)**
```typescript
// Lambda@Edge 또는 API Gateway + Lambda
const proxyUrl = `https://api.example.com/pdf-proxy?url=${encodeURIComponent(s3Url)}`;
const response = await fetch(proxyUrl);
```

---

## 200인데 요청에 실패했어요

별도로 외부 PDF 다운로드 시 200 응답을 받았는데 브라우저가 차단하는 현상도 있었다.

**단서 1**: Response Headers에 `Access-Control-Allow-Origin`이 빠져있음

**단서 2**: Request Header에 `Origin: https://localhost:5173`이 있고, `Sec-Fetch-Mode: cors` / `Sec-Fetch-Site: cross-site`가 있다

→ 브라우저가 cross-origin 요청으로 판단했지만, 서버 응답에 CORS 헤더가 없어서 차단한 것.

**핵심**: HTTP 상태 코드 200은 "서버가 정상 응답했다"는 의미이지, "브라우저가 그 응답을 사용할 수 있다"는 의미가 아니다.

---

## 정리: 프로덕션 CORS 트러블슈팅 체크리스트

1. **이미지가 안 나온다** → Base64 변환 필요한지 확인
2. **첫 요청만 성공** → 브라우저 캐시 간섭 의심, Cache-busting 적용
3. **S3 CORS 설정했는데 안 됨** → CloudFront가 Origin 헤더를 전달하는지 확인
4. **200인데 에러** → Response Headers에 CORS 헤더가 있는지 확인
5. **최종 안전망** → Lambda 프록시 fallback 구축

프로덕션에서 이미지 CORS 문제는 단일 원인이 아니라 **여러 레이어의 문제가 겹치는 경우**가 많다. 각 레이어를 독립적으로 디버깅하고, fallback 체인을 구성하는 것이 핵심이다.
