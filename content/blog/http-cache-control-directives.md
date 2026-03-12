---
title: "no-cache vs no-store vs must-revalidate — HTTP 캐시 제어 디렉티브 정리"
date: "2025-09-12"
tags: ["HTTP", "Cache", "Browser", "Network"]
---

## 혼동하기 쉬운 캐시 디렉티브

HTTP `Cache-Control` 헤더의 디렉티브들은 이름이 비슷해서 혼동하기 쉽다.

---

## no-cache

```
Cache-Control: no-cache
```

**"캐시해도 되지만, 사용 전에 반드시 서버에 확인하라"**

- 응답을 캐시에 저장함
- 하지만 매 요청마다 서버에 검증 요청 (조건부 요청)
- 서버가 304 Not Modified → 캐시 사용
- 서버가 200 OK → 새 응답 사용

```
브라우저 → 서버: "이거 아직 유효해?" (If-None-Match: "etag...")
서버 → 브라우저: 304 Not Modified (변경 없음, 캐시 사용)
또는
서버 → 브라우저: 200 OK + 새 데이터 (변경됨)
```

---

## no-store

```
Cache-Control: no-store
```

**"캐싱 자체를 금지하라"**

- 응답을 메모리/디스크 어디에도 저장하지 않음
- 매 요청마다 서버에서 완전히 새로 받아옴
- 민감한 데이터(개인정보, 금융 등)에 사용

---

## must-revalidate

```
Cache-Control: max-age=3600, must-revalidate
```

**"캐시 만료 시 반드시 서버에 재검증하라"**

- 캐시가 유효한 동안은 서버 확인 없이 캐시 사용 (no-cache와의 차이!)
- 캐시가 만료되면 **반드시** 서버에 재검증
- 서버에 연결할 수 없으면 504 Gateway Timeout 반환 (stale 응답 사용 불가)

---

## 비교 정리

| 디렉티브 | 캐시 저장 | 서버 확인 시점 | 오프라인 시 |
|---------|----------|-------------|-----------|
| `no-cache` | O | **매 요청마다** | 사용 불가 |
| `no-store` | **X** | 매 요청마다 (캐시 없으므로) | 사용 불가 |
| `must-revalidate` | O | **만료 시에만** | 사용 불가 (504) |
| (기본, `max-age`만) | O | 만료 시 | stale 사용 가능 |

---

## 실전 적용

```
# API 응답 (자주 바뀌는 데이터)
Cache-Control: no-cache

# 로그인 페이지, 결제 정보
Cache-Control: no-store

# 정적 에셋 (변경 시 파일명 해시 변경)
Cache-Control: max-age=31536000, immutable

# 일반 페이지
Cache-Control: max-age=3600, must-revalidate
```
