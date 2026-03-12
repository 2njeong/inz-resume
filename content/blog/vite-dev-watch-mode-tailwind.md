---
title: "Monorepo에서 라이브러리를 빌드 없이 바로 쓰기 -- Vite + Tailwind v4 트러블슈팅"
date: "2025-11-21"
tags: ["Vite", "Tailwind CSS", "Monorepo", "DX"]
---

## 목표

Monorepo 구조에서 `packages/library`의 소스 코드를 수정하면 `apps/ui-ground`에 HMR로 즉시 반영되도록 만든다. 라이브러리를 매번 빌드하지 않고 src를 직접 참조한다.

```
monorepo/
  apps/
    ui-ground/          # 개발용 앱
  packages/
    library/            # UI 라이브러리 (@motionz-kr/ui)
      src/
        main.ts
        styles/
          styles.css
        components/
          ...
```

## 핵심 인사이트 1: "주어가 누구인가?"

dev 모드에서는 **ui-ground의 Vite**가 마스터다. 라이브러리의 vite.config는 빌드할 때만 사용된다. 개발 중에는 ui-ground의 Vite가 라이브러리의 소스 파일을 직접 읽고, transform하고, serve한다.

따라서 모든 alias, resolve 설정은 ui-ground의 vite.config.ts에 있어야 한다.

## 핵심 인사이트 2: @source는 className 스캔 범위만 지정한다

Tailwind v4의 `@source`는 "이 경로에서 클래스 이름을 스캔하라"는 지시일 뿐, JS나 CSS를 import하는 것이 아니다.

```css
/* apps/ui-ground/src/index.css */
@import "tailwindcss";
@source "../../../../packages/library/src/**/*.{ts,tsx}";
@import "@motionz-kr/ui/styles";
```

- `@source`: Tailwind에게 라이브러리 소스에서 클래스 이름을 찾으라고 알려줌
- `@import "@motionz-kr/ui/styles"`: 라이브러리의 CSS를 Tailwind의 entry graph에 포함시킴

이 두 가지는 완전히 다른 역할이다.

## 핵심 인사이트 3: 세 가지 alias의 서로 다른 역할

ui-ground의 vite.config.ts에 세 가지 alias를 설정한다.

```ts
// apps/ui-ground/vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      // 1. 공개 API 이름 -> src로 리다이렉트 (dev 모드)
      '@motionz-kr/ui': path.resolve(__dirname, '../../packages/library/src/main.ts'),

      // 2. 공개 CSS 엔트리 -> src의 CSS 파일
      '@motionz-kr/ui/styles': path.resolve(__dirname, '../../packages/library/src/styles/styles.css'),

      // 3. 내부 편의용 alias
      '@ui': path.resolve(__dirname, '../../packages/library/src'),
    },
  },
});
```

각 alias의 역할:

| Alias | 가리키는 곳 | 역할 |
|-------|-----------|------|
| `@motionz-kr/ui` | `src/main.ts` | 패키지 이름으로 import할 때 빌드된 dist 대신 src를 참조 |
| `@motionz-kr/ui/styles` | `src/styles/styles.css` | Tailwind entry graph에 CSS를 포함시키기 위한 공개 경로 |
| `@ui` | `src/` | 컴포넌트 내부에서 상대 경로 대신 사용하는 편의 alias |

## 혼동하기 쉬운 포인트

### @ui와 @motionz-kr/ui/styles가 같은 파일을 가리키는 이유

```ts
// 컴포넌트 내부에서 (JS import)
import styles from '@ui/styles/styles.css';

// index.css에서 (Tailwind entry graph)
@import "@motionz-kr/ui/styles";
```

같은 `styles.css` 파일이지만 경로가 다르다. `@ui`는 JS 모듈 시스템에서의 내부 참조이고, `@motionz-kr/ui/styles`는 Tailwind CSS 파이프라인의 공개 API다.

### "로드"와 "Tailwind entry graph"의 차이

JS에서 `import '@ui/styles/styles.css'`로 CSS를 로드하면 Vite의 CSS 처리를 거치지만, 이것은 Tailwind의 entry graph와는 별개다. Tailwind가 이 CSS 안의 `@theme`, `@layer` 등의 지시자를 처리하려면 `@import`를 통해 Tailwind의 파이프라인에 명시적으로 포함시켜야 한다.

## 최종 설정 정리

```css
/* apps/ui-ground/src/index.css */
@import "tailwindcss";
@source "../../../../packages/library/src/**/*.{ts,tsx}";
@import "@motionz-kr/ui/styles";
```

```ts
// apps/ui-ground/vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@motionz-kr/ui': path.resolve(__dirname, '../../packages/library/src/main.ts'),
      '@motionz-kr/ui/styles': path.resolve(__dirname, '../../packages/library/src/styles/styles.css'),
      '@ui': path.resolve(__dirname, '../../packages/library/src'),
    },
  },
});
```

이 설정으로 라이브러리 소스를 수정하면 빌드 없이 ui-ground에서 HMR로 즉시 반영된다.
