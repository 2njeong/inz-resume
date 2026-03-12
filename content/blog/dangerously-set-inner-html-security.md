---
title: "dangerouslySetInnerHTML 보안 가이드 -- 언제 안전하고 언제 위험한가"
date: "2025-09-16"
tags: ["Security", "React", "XSS"]
---

## React의 기본 철학: 모든 데이터는 이스케이프된다

React는 JSX에서 렌더링하는 모든 값을 자동으로 이스케이프한다.

```tsx
const userInput = '<script>alert("XSS")</script>';

// React가 자동으로 이스케이프
return <div>{userInput}</div>;
// 렌더링 결과: &lt;script&gt;alert("XSS")&lt;/script&gt;
// 화면에 텍스트로 표시됨, 스크립트 실행되지 않음
```

이것이 React가 XSS(Cross-Site Scripting) 공격을 기본적으로 방어하는 방식이다.

## dangerouslySetInnerHTML: 이스케이프를 건너뛴다

`dangerouslySetInnerHTML`은 이름 그대로 "위험하게" 내부 HTML을 설정한다. 이스케이프 없이 HTML 문자열을 DOM에 직접 삽입한다.

```tsx
const maliciousInput = '<img src="x" onerror="alert(document.cookie)">';

// 이스케이프 없이 DOM에 삽입 → XSS 공격 가능
return <div dangerouslySetInnerHTML={{ __html: maliciousInput }} />;
```

사용자 입력을 그대로 `dangerouslySetInnerHTML`에 넣으면 XSS 공격에 노출된다.

## 안전하게 사용할 수 있는 경우

### 1. 개발자가 직접 작성한 HTML

사용자 입력이 아닌, 개발자가 코드에서 직접 작성한 HTML은 안전하다.

```tsx
const staticHtml = '<strong>강조 텍스트</strong>';
return <div dangerouslySetInnerHTML={{ __html: staticHtml }} />;
```

### 2. Sanitize된 마크다운 변환 결과

마크다운을 HTML로 변환할 때, sanitize 옵션을 활성화하면 위험한 태그가 제거된다.

```ts
import { marked } from 'marked';

const html = marked(markdownString, { sanitize: true });
// <script>, onerror 등 위험한 요소가 제거됨
```

또는 DOMPurify 같은 별도 sanitizer를 사용한다.

```ts
import DOMPurify from 'dompurify';

const cleanHtml = DOMPurify.sanitize(dirtyHtml);
return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
```

### 3. 스키마 마크업 (JSON-LD)

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: jsonLdString }}
/>
```

`type="application/ld+json"`인 script 태그는 브라우저가 **실행하지 않는다**. 이 안의 내용은 순수한 JSON 데이터로, 검색 엔진 크롤러를 위한 구조화된 데이터일 뿐이다. 따라서 `dangerouslySetInnerHTML`을 사용해도 XSS 위험이 없다.

## Next.js Script strategy

Next.js의 `<Script>` 컴포넌트는 스크립트 로딩 전략을 제공한다.

| Strategy | 로딩 시점 |
|----------|---------|
| `beforeInteractive` | 페이지 hydration 전에 로드 |
| `afterInteractive` | 페이지 hydration 후에 로드 (기본값) |
| `lazyOnload` | 브라우저가 idle 상태일 때 로드 |
| `worker` | Web Worker에서 로드 |

### 스키마 마크업에 beforeInteractive를 사용하는 이유

```tsx
import Script from 'next/script';

<Script
  id="schema-markup"
  type="application/ld+json"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
/>
```

검색 엔진 크롤러는 JavaScript를 제한적으로 실행하거나, hydration을 기다리지 않고 초기 HTML을 파싱한다. `beforeInteractive`로 설정하면 HTML에 스키마 데이터가 즉시 포함되어 크롤러가 확실히 찾을 수 있다.

## 정리

- React는 기본적으로 모든 출력을 이스케이프하여 XSS를 방지한다.
- `dangerouslySetInnerHTML`은 이 보호를 해제한다.
- 사용자 입력을 직접 넣으면 위험하다.
- 개발자가 통제하는 HTML, sanitize된 마크다운, JSON-LD 스키마 마크업에서는 안전하게 사용할 수 있다.
