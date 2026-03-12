---
title: "UI 라이브러리 빌드 프로세스 Deep Dive -- pnpm workspace에서 Vite 빌드까지"
date: "2025-10-30"
tags: ["Vite", "Build", "pnpm", "Library"]
---

## 빌드 명령어 한 줄의 여정

`pnpm --filter @motionz-kr/motionlabs-ui build`를 실행하면 내부에서 어떤 일이 일어나는지 단계별로 추적한다.

## Step 1: pnpm --filter 명령어 실행

```bash
pnpm --filter @motionz-kr/motionlabs-ui build
```

pnpm에게 "모든 패키지 중 `@motionz-kr/motionlabs-ui`라는 이름을 가진 패키지를 찾아서 `build` 스크립트를 실행하라"고 지시한다.

## Step 2: pnpm-workspace.yaml에서 패키지 범위 확인

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

pnpm은 이 설정을 읽고 `apps/`와 `packages/` 하위의 모든 디렉토리를 패키지 후보로 인식한다.

## Step 3: package.json에서 패키지 이름 매칭

pnpm은 각 패키지의 `package.json`을 확인하여 `name` 필드가 `@motionz-kr/motionlabs-ui`와 일치하는 패키지를 찾는다.

```json
// packages/library/package.json
{
  "name": "@motionz-kr/motionlabs-ui",
  "version": "1.0.0",
  "scripts": {
    "build": "vite build"
  },
  "exports": {
    ".": {
      "import": "./dist/main.js",
      "types": "./dist/main.d.ts"
    },
    "./styles": {
      "import": "./dist/styles/styles.css"
    }
  },
  "sideEffects": ["**/*.css"]
}
```

`scripts.build`가 `vite build`이므로, `packages/library/` 디렉토리에서 Vite가 실행된다.

## Step 4: Vite가 vite.config.js 읽기

```js
// packages/library/vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

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

핵심 설정:
- `entry`: 빌드의 시작점. `src/main.ts`에서 시작한다.
- `formats: ['es']`: ESModule 형식으로 출력한다.
- `external`: react, react-dom은 번들에 포함하지 않는다 (소비자가 제공).

## Step 5: Vite가 main.ts에서 dependency graph 구축

```ts
// src/main.ts
export { Badge } from './components/badge';
export { Button } from './components/button';
export { Modal } from './components/modal';
export { Input } from './components/input';
// ...
```

Vite(내부적으로 Rollup)는 `main.ts`의 export를 따라가며 모든 의존 모듈을 찾는다. 이것이 dependency graph다.

```
main.ts
  ├── components/badge/index.ts → Badge.tsx
  ├── components/button/index.ts → Button.tsx
  ├── components/modal/index.ts → Modal.tsx
  └── components/input/index.ts → Input.tsx
```

## Step 6: preserveModules 설정에 따른 출력 차이

### preserveModules: false (기본값)

Rollup이 모든 모듈을 하나의 파일로 합친다.

```
dist/
  motionlabs-ui.js    # 모든 컴포넌트 코드가 하나에
```

소비자가 `import { Badge }`를 하면, 번들러가 이 하나의 파일에서 Badge만 추출하려 시도하지만 코드가 얽혀 있으면 tree-shaking이 실패할 수 있다.

### preserveModules: true

소스 구조를 그대로 유지한다. `preserveModulesRoot: 'src'`로 출력 경로에서 `src/`를 제거한다.

```
dist/
  main.js
  components/
    badge/
      index.js
      Badge.js
    button/
      index.js
      Button.js
    modal/
      index.js
      Modal.js
```

소비자가 `import { Badge }`를 하면, 번들러가 dependency graph에서 `Badge.js`만 포함하고 나머지 컴포넌트 파일은 아예 제외한다.

## Step 7: 소비자의 번들러가 tree-shaking

소비자 앱에서:

```ts
import { Badge } from '@motionz-kr/motionlabs-ui';
```

1. 번들러가 `package.json`의 `exports["."].import`를 보고 `dist/main.js`로 진입
2. `main.js`에서 `Badge`의 re-export를 따라 `dist/components/badge/Badge.js`를 찾음
3. `sideEffects: ["**/*.css"]` 설정을 보고 JS 파일은 side effect가 없다고 판단
4. Badge와 무관한 Button, Modal 등의 파일을 최종 번들에서 제거

## 전체 흐름 요약

```
pnpm --filter @motionz-kr/motionlabs-ui build
  → pnpm-workspace.yaml에서 패키지 경로 확인
  → packages/library/package.json에서 이름 매칭
  → vite build 실행
  → vite.config.js의 entry(src/main.ts)에서 시작
  → dependency graph 구축
  → preserveModules: true로 파일 구조 유지하여 출력
  → 소비자 앱에서 import 시 tree-shaking으로 필요한 코드만 포함
```
