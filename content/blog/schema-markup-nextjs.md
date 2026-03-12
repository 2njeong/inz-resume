---
title: "Next.js에서 스키마 마크업(JSON-LD) 적용하기"
date: "2025-09-16"
tags: ["SEO", "Next.js", "Schema Markup"]
---

## 스키마 마크업이란

스키마 마크업(JSON-LD)은 웹 페이지의 콘텐츠를 검색 엔진이 이해할 수 있는 구조화된 데이터 형식이다. 검색 결과에 리치 스니펫(별점, 가격, FAQ 등)을 표시하는 데 사용된다.

## Next.js에서의 구현

```tsx
import Script from 'next/script';

interface SchemaMarkupProps {
  id: string;
  data: Record<string, unknown>;
}

function SchemaMarkup({ id, data }: SchemaMarkupProps) {
  const jsonLd = JSON.stringify(data);

  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
```

사용 예시:

```tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'My Company',
  url: 'https://example.com',
  logo: 'https://example.com/logo.png',
};

<SchemaMarkup id="organization-schema" data={organizationSchema} />
```

## 각 속성의 역할

### type="application/ld+json"

브라우저에게 이 script 태그의 내용이 JavaScript가 아닌 **구조화된 데이터(JSON-LD)**임을 알려준다. 브라우저는 이 내용을 실행하지 않고, 검색 엔진 크롤러만 파싱한다.

### strategy="beforeInteractive"

Next.js `<Script>` 컴포넌트의 로딩 전략이다. `beforeInteractive`는 React hydration이 일어나기 전에 HTML에 포함시킨다.

검색 엔진 크롤러는 JavaScript 실행을 제한적으로 하거나 아예 하지 않을 수 있다. `beforeInteractive`로 설정하면 서버에서 렌더링된 초기 HTML에 스키마 데이터가 포함되므로 크롤러가 확실히 읽을 수 있다.

### dangerouslySetInnerHTML

여기서 `dangerouslySetInnerHTML`은 안전하다. 이유:

1. `type="application/ld+json"`이므로 브라우저가 내용을 실행하지 않는다.
2. 삽입되는 내용은 순수한 JSON 데이터다.
3. 이 데이터는 검색 엔진 크롤러만 읽는 용도다.

## JSON.stringify 출력 형식

```ts
// 압축된 형식 (프로덕션 권장)
JSON.stringify(data);
// {"@context":"https://schema.org","@type":"Organization","name":"My Company"}

// 보기 좋은 형식 (디버깅용)
JSON.stringify(data, null, 2);
// {
//   "@context": "https://schema.org",
//   "@type": "Organization",
//   "name": "My Company"
// }
```

프로덕션에서는 압축된 형식을 사용하여 HTML 크기를 줄이는 것이 좋다. 디버깅할 때는 `null, 2`를 추가하여 가독성을 높일 수 있다.

## 정리

| 속성 | 값 | 역할 |
|------|---|------|
| `type` | `application/ld+json` | 브라우저 실행 방지, 구조화된 데이터임을 선언 |
| `strategy` | `beforeInteractive` | hydration 전에 HTML에 포함하여 크롤러가 읽을 수 있도록 함 |
| `dangerouslySetInnerHTML` | `{ __html: jsonLd }` | JSON 문자열을 script 태그에 삽입 (type 덕분에 안전) |
