---
title: "pnpm vs npm: Monorepo에서는 pnpm, 단일 앱에서는 npm을 선택한 이유"
date: "2025-10-30"
tags: ["pnpm", "npm", "Monorepo", "DevOps"]
---

## 브랜치별로 다른 패키지 매니저를 쓰는 구조

프로젝트에서 두 개의 브랜치를 서로 다른 용도로 운영하고 있다.

- **develop 브랜치**: Monorepo 구조 (앱 + UI 라이브러리)
- **main 브랜치**: 단일 앱 배포용

각 브랜치의 요구사항이 다르기 때문에 패키지 매니저도 다르게 선택했다.

## develop 브랜치: pnpm

Monorepo에서 pnpm을 선택한 이유는 명확하다.

### 1. Workspace 지원과 --filter

```bash
# 특정 패키지만 빌드
pnpm --filter @motionz-kr/motionlabs-ui build

# 특정 패키지에 의존성 추가
pnpm --filter @motionz-kr/motionlabs-ui add lodash

# 특정 패키지의 스크립트 실행
pnpm --filter apps/ui-ground dev
```

`pnpm-workspace.yaml`로 패키지 범위를 정의하고, `--filter`로 특정 패키지를 대상으로 명령을 실행할 수 있다.

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2. 디스크 절약 (symlink 기반)

pnpm은 모든 패키지를 content-addressable store에 저장하고 symlink로 연결한다. 같은 버전의 패키지를 여러 프로젝트에서 사용해도 디스크에는 한 번만 저장된다.

### 3. Strict 의존성 관리

npm은 hoisting으로 인해 **phantom dependency** 문제가 발생할 수 있다. `package.json`에 선언하지 않은 패키지를 다른 패키지의 hoisting 덕분에 사용할 수 있게 되는 것이다. pnpm은 기본적으로 이를 차단한다.

```
# npm의 flat node_modules (phantom dependency 가능)
node_modules/
  react/
  lodash/          # A가 설치한 건데 B에서도 접근 가능

# pnpm의 격리된 node_modules
node_modules/
  .pnpm/
    react@18.2.0/
    lodash@4.17.21/
  A/ -> .pnpm/A/node_modules/A   # A만 자신의 의존성 접근 가능
```

## main 브랜치: npm

단일 앱 배포에서 npm을 선택한 이유:

### 1. 단순함

Monorepo 구조가 아닌 단일 앱에서는 workspace, filter 같은 기능이 불필요하다. npm은 Node.js에 기본 포함되어 있어 별도 설치가 필요 없다.

### 2. 표준 도구

CI/CD 환경에서 npm은 별도 설치 단계 없이 바로 사용할 수 있다. pnpm을 사용하려면 `corepack enable` 또는 별도 설치가 필요하다.

### 3. 오버킬 방지

pnpm의 장점인 symlink, strict dependency, workspace는 단일 앱에서는 체감하기 어렵다. 불필요한 복잡도를 추가할 이유가 없다.

## 비교 정리

| 기준 | pnpm (develop) | npm (main) |
|------|---------------|------------|
| Workspace filtering | `--filter`로 개별 패키지 제어 | 기본 workspace 지원은 있으나 filter 기능 부족 |
| 디스크 사용량 | symlink 기반으로 중복 제거 | 패키지별 전체 복사 |
| 설치 속도 | 캐시 활용으로 빠름 | 상대적으로 느림 |
| 의존성 엄격도 | phantom dependency 차단 | hoisting으로 인한 암묵적 접근 가능 |
| 설치 필요 여부 | 별도 설치 필요 | Node.js에 포함 |

## 왜 하나로 통일하지 않는가

- **npm으로 통일**: Monorepo에서 `--filter`와 동등한 수준의 워크스페이스 제어가 어렵다. phantom dependency 문제도 해결되지 않는다.
- **pnpm으로 통일**: 단일 앱에서는 pnpm의 장점을 살리기 어렵고, CI 환경에서 추가 설치 단계가 생긴다.

브랜치별 요구사항이 다르면 도구도 다르게 선택하는 것이 합리적이다.
