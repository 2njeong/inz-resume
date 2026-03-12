---
title: "Sentry + Vite 소스맵 업로드 설정과 sourcemap: hidden vs true"
date: "2025-09-12"
tags: ["Sentry", "Vite", "DevOps", "Debugging"]
---

## 빌드 파이프라인

Sentry와 Vite를 함께 사용할 때의 소스맵 업로드 파이프라인은 다음과 같다.

```
vite build
  → 번들 파일 생성 (.js + .map)
  → @sentry/vite-plugin의 closeBundle 훅 실행
    → Sentry release 태그 생성
    → .map 파일을 Sentry 서버에 업로드
    → .map 파일 삭제 (filesToDeleteAfterUpload)
  → 배포
```

핵심은 소스맵 파일이 **Sentry에는 업로드되지만 프로덕션 서버에는 배포되지 않는 것**이다.

## sourcemap: 'hidden' vs sourcemap: true

### sourcemap: 'hidden' (권장)

```ts
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
});
```

- `.map` 파일을 생성한다.
- 번들 파일 끝에 `//# sourceMappingURL=...` 주석을 **추가하지 않는다**.
- 브라우저가 `.map` 파일의 존재를 모르므로 요청하지 않는다.
- Sentry 플러그인이 `.map`을 업로드한 후 삭제하면 깔끔하게 정리된다.

### sourcemap: true (문제 발생)

```ts
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true,
  },
});
```

- `.map` 파일을 생성한다.
- 번들 파일 끝에 `//# sourceMappingURL=index-abc123.js.map` 주석을 **추가한다**.
- Sentry 플러그인이 `.map`을 업로드한 후 `filesToDeleteAfterUpload`로 삭제한다.
- 문제: 번들 파일에 `sourceMappingURL` 주석이 남아있다.
- 브라우저가 `.map` 파일을 요청하지만 파일이 없으므로 **404 에러**가 발생한다.
- 개발자 도구 콘솔에 `Failed to load source map` 경고가 반복적으로 출력된다.

## 비교 정리

| 설정 | .map 생성 | sourceMappingURL 주석 | .map 삭제 후 결과 |
|------|----------|---------------------|-----------------|
| `'hidden'` | O | X | 문제 없음 |
| `true` | O | O | 404 에러 + 콘솔 경고 |

## 권장 설정

```ts
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    sentryVitePlugin({
      org: 'my-org',
      project: 'my-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: '**/*.map',
      },
    }),
  ],
});
```

프로덕션에서 Sentry를 사용할 때는 `sourcemap: 'hidden'`을 사용한다. 소스맵은 Sentry에만 존재하고, 브라우저에서는 요청하지 않으며, 404 에러도 발생하지 않는다.
