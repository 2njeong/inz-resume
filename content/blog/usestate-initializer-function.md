---
title: "useState 초기값을 함수형으로 선언해야 하는 이유"
date: "2025-08-01"
tags: ["React", "Performance", "useState"]
---

## 문제

`useState`의 초기값으로 비용이 큰 함수를 호출하면, 리렌더링마다 불필요하게 실행된다.

```typescript
// ❌ 리렌더링마다 getInitialOpenMenus() 실행
const [openMenus, setOpenMenus] = useState(getInitialOpenMenus());

// ✅ 마운트 시 1회만 실행
const [openMenus, setOpenMenus] = useState(() => getInitialOpenMenus());
```

---

## 차이

| 방식 | 호출 시점 | 결과 사용 |
|------|----------|----------|
| `useState(fn())` | **매 렌더링마다** 실행 | 초기 렌더링 시만 사용 |
| `useState(() => fn())` | **마운트 시 1회만** 실행 | 초기 렌더링 시 사용 |

두 방식 모두 **초기 렌더링에서의 상태값은 동일**하다. 차이는 리렌더링 시 불필요한 실행이 발생하느냐의 여부.

---

## 언제 함수형을 써야 하나?

```typescript
// 단순한 값 → 직접 전달해도 OK
useState(0);
useState('');
useState(false);

// 계산 비용이 있는 값 → 함수형
useState(() => JSON.parse(localStorage.getItem('data') || '{}'));
useState(() => generateComplexInitialState(props));
useState(() => expensiveComputation());
```

초기값 계산에 비용이 있다면 **lazy initializer** (함수형)를 사용하자. React는 이 함수를 마운트 시 한 번만 호출하고, 이후 렌더링에서는 무시한다.
