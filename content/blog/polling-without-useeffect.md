---
title: "useEffect 없이 폴링 구현하기 — TanStack Query refetchInterval 활용"
date: "2025-09-20"
tags: ["React", "TanStack Query", "Architecture", "Performance"]
---

## 배경

리포트 생성 API가 비동기로 동작하는 구조에서, 생성 상태를 주기적으로 확인하는 폴링 로직이 필요했다.

- 서버가 202(생성 중)를 반환하면 5초마다 재요청
- 200(완료)을 반환하면 폴링 중단 후 데이터 갱신
- 새로고침 후에도 폴링이 유지되어야 함
- 되돌리기 시 깜빡임 방지

---

## TanStack Query의 refetchInterval

`useEffect` + `setInterval` 대신 TanStack Query의 `refetchInterval` 옵션을 활용했다.

```typescript
const { data } = useQuery({
  queryKey: ['report', id],
  queryFn: () => fetchReport(id),
  refetchInterval: (query) => {
    const status = query.state.data?.status;

    // 생성 중이면 5초마다 폴링
    if (status === 202) return 5000;

    // 완료되면 폴링 중단
    return false;
  },
});
```

`refetchInterval`에 함수를 전달하면, 매 fetch 후 다음 폴링 간격을 동적으로 결정할 수 있다. `false`를 반환하면 폴링이 중단된다.

---

## 완료 시 자동 invalidate

폴링이 끝나고 데이터가 완성되면, 관련 쿼리들을 자동으로 갱신해야 한다.

```typescript
const { data } = useQuery({
  queryKey: ['report', id],
  queryFn: () => fetchReport(id),
  refetchInterval: (query) => {
    const data = query.state.data;

    if (data?.status === 200 && data?.result) {
      // 완료 → 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['reportList'] });
      return false;
    }

    if (data?.status === 202) return 5000;
    return false;
  },
});
```

---

## 되돌리기 시 깜빡임 방지

사용자가 리포트를 되돌리기(mutation)한 직후, 이전 데이터가 잠깐 보였다가 사라지는 깜빡임이 있었다.

```typescript
refetchInterval: (query) => {
  // mutation이 진행 중이면 폴링하지 않음
  const isMutating = queryClient
    .getMutationCache()
    .findAll({ status: 'pending' })
    .some(m => m.options.mutationKey?.[0] === 'revertReport');

  if (isMutating) return false;

  // ...기존 폴링 로직
},
```

`getMutationCache()`를 활용해 mutation 상태를 체크하고, 진행 중일 때는 폴링을 건너뛰는 방식으로 해결했다.

---

## useEffect 폴링 vs refetchInterval 비교

### useEffect 방식

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetchReport(id);
    if (data.status === 200) {
      clearInterval(interval);
      setData(data);
    }
  }, 5000);
  return () => clearInterval(interval);
}, [id]);
```

문제점:
- 수동 상태 관리 필요
- 캐시, 중복 요청 방지 직접 구현
- 컴포넌트 언마운트 시 cleanup 신경 써야 함

### refetchInterval 방식

- TanStack Query의 캐시 인프라 활용
- 자동 cleanup, 중복 요청 방지
- `getMutationCache()` 같은 고급 기능 활용 가능
- 선언적이고 예측 가능한 코드

---

## 핵심 포인트

1. **refetchInterval에 함수를 전달**하면 동적 폴링 제어가 가능하다
2. **`false` 반환으로 폴링 중단** — 무한 루프 걱정 없음
3. **getMutationCache()로 mutation 상태 확인** — 깜빡임 방지에 유용
4. **useEffect 없이도 복잡한 폴링 시나리오를 선언적으로 표현**할 수 있다
