---
title: "RHF의 defaultValues가 reset() 후에도 초기화되지 않는 이유"
date: "2025-07-21"
tags: ["React", "React Hook Form", "Troubleshooting"]
---

## 문제

React Hook Form(RHF)에서 폼을 `reset()` 호출로 초기화했는데, 입력값이 사라지지 않는 현상이 있었다.

---

## 원인: defaultValues의 동작 방식

RHF의 `defaultValues`는 **마운트 시점의 값**을 내부 ref에 저장한다.

```typescript
const { register, reset } = useForm({
  defaultValues: {
    name: fetchedData?.name || '',
  },
});
```

### 시나리오

1. 첫 마운트: `defaultValues.name = ''` (데이터 없음)
2. 사용자가 "홍길동" 입력
3. 데이터 fetch 완료: `fetchedData.name = "홍길동"`
4. `reset()` 호출
5. **기대**: 입력창이 빈 값으로 초기화
6. **실제**: RHF는 마운트 시점의 defaultValues(`''`)로 리셋... 하지만 브라우저가 캐시한 값이 남아있을 수 있음

핵심: `defaultValues`는 마운트 시 **한 번만** 평가된다. 이후 외부 데이터가 바뀌어도 defaultValues는 갱신되지 않는다.

---

## 해결

### 방법 1: reset()에 새 값 전달

```typescript
reset({
  name: '',  // 명시적으로 초기값 지정
});
```

### 방법 2: useEffect로 defaultValues 동기화

```typescript
useEffect(() => {
  if (fetchedData) {
    reset({
      name: fetchedData.name,
    });
  }
}, [fetchedData, reset]);
```

---

## 핵심

- `defaultValues`는 마운트 시 1회만 평가되는 **초기값**
- `reset()`은 기본적으로 `defaultValues`로 돌아감
- 동적 데이터를 반영하려면 `reset(newValues)`로 명시적 전달 필요
