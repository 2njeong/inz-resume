---
title: "React 컴포넌트 라이브러리에 Tree-shaking 적용하기"
date: "2025-10-29"
tags: ["Vite", "Tree-shaking", "Library", "Performance"]
---

## 문제 발견

사내 UI 라이브러리 `@motionz-kr/motionlabs-ui`를 사용하는 동료로부터 피드백을 받았다.

> "Badge 하나만 import했는데 모든 컴포넌트가 다 딸려 옵니다."

확인해 보니 실제로 `import { Badge } from '@motionz-kr/motionlabs-ui'`를 하면 번들 크기가 200KB 이상이었다. Badge 하나의 코드는 수백 바이트에 불과한데, 라이브러리 전체가 포함되고 있었다.

## 원인 분석

빌드 결과물을 확인해 보니 모든 컴포넌트가 하나의 `dist/motionlabs-ui.js` 파일에 합쳐져 있었다. 번들러 입장에서는 이 파일 안의 어떤 코드가 사용되고 어떤 코드가 사용되지 않는지 판단하기 어렵다.

Tree-shaking이 작동하려면 두 가지 조건이 필요하다:

1. **파일 단위로 분리된 빌드 결과물** -- 번들러가 dependency graph에서 사용하지 않는 파일을 아예 제외할 수 있어야 한다.
2. **Side effects 선언** -- 번들러에게 "이 모듈을 import하는 것만으로 발생하는 부수 효과가 없다"고 알려줘야 한다.

### Re-export는 "중개인"이다

`main.ts`에서 `export { Badge } from './components/badge'` 같은 re-export를 하면, 번들러 입장에서 `main.ts`는 모든 컴포넌트의 중개인(middleman) 역할을 한다. 하나의 파일에 모든 것이 합쳐져 있으면 이 중개인을 통해 모든 코드가 연결되어 tree-shaking이 불가능해진다.

## Solution 1: preserveModules로 파일 구조 유지

`vite.config.js`의 rollupOptions에서 `preserveModules` 설정을 활성화한다.

### 변경 전

```js
// vite.config.js
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        // preserveModules 설정 없음
      },
    },
  },
});
```

이 설정의 빌드 결과:

```
dist/
  motionlabs-ui.js    # 모든 코드가 하나의 파일에 합쳐짐
```

### 변경 후

```js
// vite.config.js
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
});
```

이 설정의 빌드 결과:

```
dist/
  main.js
  components/
    badge/
      Badge.js
    button/
      Button.js
    modal/
      Modal.js
    ...
```

`preserveModules: true`는 Rollup에게 "소스 코드의 모듈 구조를 그대로 유지하라"고 지시한다. `preserveModulesRoot: "src"`는 출력 경로에서 `src/` 접두사를 제거하여 깔끔한 구조를 만든다.

## Solution 2: sideEffects로 안전한 제거 허용

파일이 분리되어도 번들러가 "이 파일을 제거해도 안전한가?"를 판단할 수 없으면 tree-shaking이 작동하지 않는다. `package.json`에 `sideEffects` 필드를 추가한다.

```json
{
  "name": "@motionz-kr/motionlabs-ui",
  "sideEffects": ["**/*.css"]
}
```

이 설정은 번들러에게 다음을 알려준다:

- CSS 파일은 side effect가 있다 (import만으로 스타일이 적용되므로 제거하면 안 된다).
- 그 외 JS/TS 파일은 side effect가 없다 (import하지 않으면 안전하게 제거할 수 있다).

## 결과 측정

두 가지 설정을 모두 적용한 후 번들 크기를 측정했다.

```js
// 테스트: Badge만 import
import { Badge } from '@motionz-kr/motionlabs-ui';

// 변경 전: 35,520 bytes (모든 컴포넌트 포함)
// 변경 후:    144 bytes (Badge 코드만 포함)
```

**246배 차이**가 난다. Badge 하나만 사용하는 페이지에서 35KB 대신 144바이트만 로드된다.

## 정리

Tree-shaking이 제대로 작동하려면 라이브러리 빌드 설정에서 두 가지를 챙겨야 한다:

| 설정 | 역할 |
|------|------|
| `preserveModules: true` | 파일 구조를 유지하여 번들러가 파일 단위로 포함/제외 판단 가능 |
| `sideEffects: ["**/*.css"]` | 번들러에게 JS 파일은 안전하게 제거 가능하다고 선언 |

라이브러리를 만들 때 "소비자(consumer)의 번들러가 어떻게 이 코드를 처리할 것인가"를 항상 염두에 두어야 한다.
