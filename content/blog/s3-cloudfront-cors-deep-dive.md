---
title: "AWS S3 + CloudFront CORS 정책 — CNAME, Preflight, 실패 시나리오 정리"
date: "2025-08-10"
tags: ["AWS", "CORS", "CloudFront", "S3"]
---

## S3 CORS 정책이 필요한 이유

CORS는 **브라우저의 보안 정책**이다. 브라우저에서 S3로 직접 요청할 때, S3 응답에 `Access-Control-Allow-Origin` 헤더가 없으면 브라우저가 응답을 차단한다.

서버 간 통신(백엔드 → S3)에는 CORS가 적용되지 않는다. CORS는 오직 **브라우저 → 외부 서버** 구간에서만 동작한다.

---

## CloudFront CORS 정책이 필요한 이유

일반적인 아키텍처:

```
브라우저 → CloudFront → S3
```

브라우저 입장에서 요청 대상은 CloudFront다. CloudFront가 S3의 CORS 헤더를 제대로 전달하지 않으면, 브라우저에서 CORS 에러가 발생한다.

CloudFront에서 CORS 관련 설정이 필요한 이유:
- Origin 헤더를 S3로 **전달**해야 함
- S3의 CORS 응답 헤더를 **캐시**하지 않거나, Origin별로 캐시해야 함

---

## CNAME vs CORS — 별개의 레이어

**오해**: "CNAME으로 같은 도메인을 쓰면 CORS가 필요 없다"

**사실**: CNAME은 DNS 레벨 매핑이고, CORS는 브라우저 보안 정책이다. 완전히 별개의 레이어다.

```
app.example.com       → CloudFront (React 앱)
images.example.com    → CloudFront (이미지 S3)
```

`app.example.com`에서 `images.example.com`으로 요청하면, 서브도메인이라도 **Cross-Origin**이다. CNAME을 등록했다고 CORS가 면제되지 않는다.

CORS가 불필요한 경우는 **정확히 같은 Origin** (프로토콜 + 호스트 + 포트)에서 서빙할 때뿐이다.

---

## CORS 우회 전략

CORS는 브라우저 정책이므로, 브라우저가 "같은 Origin"으로 인식하게 만들면 우회 가능하다.

### 1. 내부 프록시 서버

```typescript
// Next.js API Route
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  // 서버 → S3 통신에는 CORS가 없음
  const response = await fetch(url);
  const data = await response.blob();
  return new Response(data);
}
```

### 2. 백엔드 API 엔드포인트

백엔드에서 S3 데이터를 가져와서 같은 도메인의 API로 제공한다.

### 3. 빌드 타임 번들링

```typescript
// Vite 플러그인으로 빌드 시 S3에서 다운로드하여 번들에 포함
// 실시간 업데이트 불가능하지만, 정적 에셋에 적합
```

---

## Preflight OPTIONS 실패 시나리오

### 실패 케이스

```
1. 브라우저가 OPTIONS 요청 전송
2. CloudFront → S3 전달
3. S3가 403 Forbidden 반환 (CORS 정책 미설정 또는 잘못된 설정)
4. 브라우저가 실제 GET 요청을 차단
```

핵심: **CORS 정책이 적용되려면 성공적인 응답(200)이 필요**하다. S3에서 403을 반환하면 CORS 헤더 자체가 없으므로 브라우저가 데이터를 받을 수 없다.

### 성공 케이스 (CloudFront CORS-with-preflight 정책)

```
1. Simple Request로 GET 전송
2. CloudFront → S3, 200 OK 반환
3. CloudFront가 CORS 헤더(Access-Control-Allow-Origin 등) 추가
4. 브라우저가 CORS 헤더 확인 후 JavaScript에 데이터 전달
```

---

## 정리

| 레이어 | 역할 | CORS와의 관계 |
|--------|------|--------------|
| DNS (CNAME) | 도메인 → IP 매핑 | CORS와 무관 |
| CloudFront | CDN, 캐시, 배포 | CORS 헤더 전달/캐시 설정 필요 |
| S3 | 파일 저장소 | CORS 정책 설정 필요 |
| 브라우저 | 보안 정책 실행 | CORS 헤더 확인 후 차단/허용 |

CORS 문제를 해결할 때는 **어느 레이어에서 문제가 발생하는지**를 먼저 파악하는 것이 중요하다.
