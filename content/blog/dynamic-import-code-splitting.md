---
title: "동적 import로 초기 로딩 시간 줄이기 — 코드 스플리팅 실전 패턴"
date: "2025-07-22"
tags: ["JavaScript", "Performance", "Webpack", "Vite"]
---

## 동적 import란?

ES 모듈의 `import()` 함수는 모듈을 **런타임에 비동기로 로드**한다. 정적 `import`와 달리 번들에 포함되지 않고, 필요한 시점에 별도 청크로 로드된다.

```typescript
// 정적 import: 번들에 항상 포함
import { heavyFunction } from './heavy-module';

// 동적 import: 필요할 때만 로드
const module = await import('./heavy-module');
module.heavyFunction();
```

---

## 핵심 특성

### 항상 Promise를 반환한다

```typescript
const module = await import('./utils');
// module은 모듈 전체 객체
// { default: ..., namedExport1: ..., namedExport2: ... }
```

### 전체 모듈 객체를 반환한다

```typescript
// 모듈 파일
export default function main() { /* ... */ }
export const helper = () => { /* ... */ };

// 사용
const mod = await import('./module');
mod.default();    // default export
mod.helper();     // named export
```

---

## 실전 사용 패턴

### 1. 코드 스플리팅

```typescript
// 라우트 기반 스플리팅
const AdminPage = lazy(() => import('./pages/AdminPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

// 무거운 라이브러리 지연 로딩
const handleExport = async () => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // ...
};
```

### 2. 조건부 모듈 로딩

```typescript
const getParser = async (fileType: string) => {
  switch (fileType) {
    case 'csv':
      return await import('./parsers/csv');
    case 'xlsx':
      return await import('./parsers/xlsx');
    case 'json':
      return await import('./parsers/json');
  }
};
```

### 3. 플러그인 시스템

```typescript
const loadPlugins = async (pluginNames: string[]) => {
  const plugins = await Promise.all(
    pluginNames.map(name => import(`./plugins/${name}`))
  );
  return plugins.map(p => p.default);
};
```

### 4. i18n (국제화)

```typescript
const loadLocale = async (lang: string) => {
  const messages = await import(`./locales/${lang}.json`);
  return messages.default;
};
```

---

## 번들러와의 관계

Webpack과 Vite는 `import()`를 만나면 자동으로 **별도 청크**를 생성한다.

```typescript
// 이 코드는 빌드 시 별도 청크로 분리됨
const module = await import('./heavy-chart-library');
```

빌드 결과:
```
dist/
  ├── index-abc123.js        (메인 번들)
  ├── heavy-chart-def456.js  (동적 import 청크)
  └── ...
```

---

## 주의점

1. **네트워크 요청 발생**: 동적 import는 HTTP 요청을 만든다. 너무 잘게 쪼개면 오히려 성능 저하
2. **로딩 상태 처리 필요**: `Suspense`나 로딩 UI를 함께 사용
3. **에러 처리**: 네트워크 실패 시 모듈 로드 실패 가능

```typescript
try {
  const module = await import('./optional-feature');
  module.init();
} catch {
  console.warn('Optional feature not available');
}
```

---

## 정리

| 사용 시점 | 이유 |
|----------|------|
| 무거운 라이브러리 (PDF, 차트 등) | 초기 번들 크기 감소 |
| 라우트별 페이지 | 방문하지 않는 페이지 코드 제외 |
| 조건부 기능 | 특정 조건에서만 필요한 코드 분리 |
| 다국어 리소스 | 현재 언어만 로드 |

초기 로딩 시간을 줄이고 싶다면, **사용자가 즉시 필요하지 않은 코드**를 동적 import로 분리하는 것부터 시작하자.
