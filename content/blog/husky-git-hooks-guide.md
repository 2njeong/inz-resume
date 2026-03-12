---
title: "Husky 완전 정복: Git Hooks를 활용한 코드 품질 관리"
date: "2025-11-05"
tags: ["Git", "Husky", "lint-staged", "DX"]
---

## Husky란?

Husky는 **Git hooks를 쉽게 관리할 수 있게 해주는 도구**다. Git hooks는 Git 이벤트(commit, push 등)가 발생할 때 자동으로 실행되는 스크립트인데, Husky 없이는 `.git/hooks/` 디렉토리에 직접 파일을 만들어야 하고, 이 파일들은 Git으로 관리되지 않아 팀원들과 공유하기 어렵다.

Husky를 사용하면:
- Git hooks를 버전 관리할 수 있음 (`.husky/` 디렉토리에 저장)
- 팀원들이 `yarn install`만 하면 자동으로 설정됨
- 설정이 간단하고 직관적임

---

## Pre-commit vs Pre-push: 언제 무엇을 검사할까?

### Pre-commit: 빠른 피드백

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

변경된 파일만 체크하므로 빠르다. `lint-staged` 설정:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

### Pre-push: 최종 검증

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running type check..."
yarn tsc --noEmit

echo "🔍 Running lint check..."
yarn lint

echo "✅ Pre-push checks passed!"
```

전체 코드를 검사하므로 느릴 수 있지만, main 브랜치로 푸시하기 전 최종 방어선 역할을 한다.

| 구분 | 실행 시점 | 검사 범위 | 속도 | 목적 |
|------|----------|----------|------|------|
| Pre-commit | 커밋 직전 | 변경된 파일만 | 빠름 | 빠른 피드백 |
| Pre-push | 푸시 직전 | 전체 코드 | 느릴 수 있음 | 확실한 검증 |

---

## Husky의 동작 Flow (핵심!)

```
git commit 실행
    ↓
Git이 .git/hooks/pre-commit 찾음 (Git 기본 기능)
    ↓
.git/hooks/pre-commit 실행 (Husky가 만든 파일)
    ↓
.husky/pre-commit 실행
    ↓
.husky/_/husky.sh 로드 (Husky 환경 설정)
    ↓
npx lint-staged 실행
```

### Step 1: `prepare` 스크립트의 역할

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

`prepare`는 npm/yarn의 **lifecycle script**로, `yarn install` 시 자동으로 실행된다. 팀원들이 `yarn install`만 하면 자동으로 Git hooks가 설정되도록 하는 것이 핵심.

### Step 2: 초기화 시 생성되는 파일들

```
.husky/
  ├── _/
  │   └── husky.sh          ← Husky가 생성 (헬퍼 함수/환경 설정)
  ├── pre-commit            ← 우리가 만든 파일
  └── pre-push              ← 우리가 만든 파일

.git/hooks/
  ├── pre-commit            ← Husky가 생성 (Git hooks 연결)
  └── pre-push              ← Husky가 생성
```

`.git/hooks/pre-commit` 파일 내용 (Husky가 자동 생성):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/../.husky/pre-commit"
```

이 파일이 Git과 `.husky/pre-commit`을 연결하는 **다리 역할**을 한다.

### Step 3: 경로 계산

```bash
# .husky/pre-commit 파일 내에서
"$0" = ".husky/pre-commit"
$(dirname -- "$0") = ".husky"
"$(dirname -- "$0")/_/husky.sh" = ".husky/_/husky.sh"
```

`_/husky.sh`는 여러 훅에서 공통으로 사용하는 Husky 헬퍼 함수와 환경 설정을 포함한다. 재사용성, 유지보수, 일관성을 위해 분리되어 있다.

---

## Q&A

### `tsc --noEmit`에서 `--noEmit`을 빼면?

프로젝트의 `tsconfig.json`에 `noEmit: true`가 설정되어 있으면 동일하게 동작한다. 하지만 명시적으로 `--noEmit`을 쓰면 의도가 더 명확하다.

### `lint-staged`와 전체 `lint`의 차이?

| 특징 | lint-staged | yarn lint |
|------|------------|-----------|
| 검사 범위 | 변경된 파일만 | 전체 코드 |
| 속도 | 빠름 | 느릴 수 있음 |
| 사용 시점 | Pre-commit | Pre-push |

### `prepare`와 `pre-push`의 관계?

직접적인 관련은 없다. `prepare`는 `yarn install` 시 Husky 초기화(설정 단계), `pre-push`는 `git push` 시 Git이 자동 실행(실행 단계).

### Git이 `.husky/pre-commit`을 자동으로 찾나?

아니다. Git은 `.git/hooks/pre-commit`만 자동 실행한다. Husky가 `.git/hooks/pre-commit` 파일을 생성하고, 그 파일이 `.husky/pre-commit`을 가리키도록 설정하는 것이다.

---

## 핵심 정리

1. **Pre-commit과 Pre-push의 역할 구분**: 빠른 피드백 vs 확실한 검증
2. **Husky의 동작 Flow**: `.git/hooks/` → `.husky/` 연결 방식
3. **Lifecycle Scripts**: `prepare` 스크립트로 팀 전체 자동 설정
