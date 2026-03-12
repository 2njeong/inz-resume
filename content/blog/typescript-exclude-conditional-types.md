---
title: "TypeScript Exclude와 조건부 타입으로 상태별 설정 분기하기"
date: "2025-10-10"
tags: ["TypeScript", "Generics", "Conditional Types"]
---

## 문제

상태(status) 설정 객체가 있는데, 특정 제너릭 타입에 따라 일부 상태의 설정을 다르게 적용해야 했다.

```typescript
const BASE_STATUS_INFO = {
  PENDING: { translationKey: '작성 전', label: '작성 전', color: 'grey' },
  IN_PROGRESS: { translationKey: '작성 중', label: '작성 중', color: 'green' },
  DELAYED: { translationKey: '저장 대기', label: '저장 대기', color: 'grey' },
  COMPLETED: { translationKey: '작성 완료', label: '작성 완료', color: 'blue' },
  DRAFT: { translationKey: '임시 저장', label: '임시 저장', color: 'purple' },
  SKIPPED: { translationKey: '미검사', label: '미검사', color: 'yellow' },
} as const;
```

요구사항: **제너릭 T가 'A'이면, DRAFT 상태를 IN_PROGRESS와 동일하게 변경**. 그 외에는 그대로 사용.

---

## 해결: Exclude + Pick + 조건부 타입

```typescript
type StatusConfig<T> = T extends 'A'
  ? Pick<typeof BASE_STATUS_INFO, Exclude<keyof typeof BASE_STATUS_INFO, 'DRAFT'>> & {
      DRAFT: typeof BASE_STATUS_INFO['IN_PROGRESS']
    }
  : typeof BASE_STATUS_INFO;
```

### 분해해서 이해하기

**1단계: `Exclude`로 DRAFT 제거**

```typescript
Exclude<keyof typeof BASE_STATUS_INFO, 'DRAFT'>
// = 'PENDING' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED' | 'SKIPPED'
```

`Exclude<Union, ExcludedMembers>`는 유니온 타입에서 특정 멤버를 제거한다.

**2단계: `Pick`으로 나머지 상태 선택**

```typescript
Pick<typeof BASE_STATUS_INFO, Exclude<...>>
// = { PENDING: ..., IN_PROGRESS: ..., DELAYED: ..., COMPLETED: ..., SKIPPED: ... }
```

DRAFT를 제외한 나머지 상태들의 타입.

**3단계: 새로운 DRAFT 타입 합치기**

```typescript
& { DRAFT: typeof BASE_STATUS_INFO['IN_PROGRESS'] }
```

DRAFT의 타입을 IN_PROGRESS의 타입으로 교체해서 합친다.

---

## Exclude vs Omit

둘 다 "제거"하는 역할이지만 대상이 다르다:

| 유틸리티 | 대상 | 용도 |
|---------|------|------|
| `Exclude<T, U>` | **유니온 타입** | 유니온에서 특정 멤버 제거 |
| `Omit<T, K>` | **객체 타입** | 객체에서 특정 키 제거 |

```typescript
// Exclude: 유니온에서 제거
type Status = 'PENDING' | 'DRAFT' | 'COMPLETED';
type WithoutDraft = Exclude<Status, 'DRAFT'>; // 'PENDING' | 'COMPLETED'

// Omit: 객체에서 제거
type Info = { name: string; age: number; email: string };
type WithoutEmail = Omit<Info, 'email'>; // { name: string; age: number }
```

---

## 활용 패턴

이 패턴은 **설정 객체의 일부만 조건부로 바꿔야 할 때** 유용하다:

```typescript
// 환경별 설정 분기
type EnvConfig<T> = T extends 'production'
  ? Omit<BaseConfig, 'debug'> & { debug: false }
  : BaseConfig;

// 역할별 권한 분기
type Permissions<T> = T extends 'admin'
  ? BasePermissions & { canDelete: true }
  : Pick<BasePermissions, Exclude<keyof BasePermissions, 'canDelete'>>;
```

타입 레벨에서 분기 로직을 표현하면, 런타임 에러 없이 **컴파일 타임에 잘못된 사용을 방지**할 수 있다.
