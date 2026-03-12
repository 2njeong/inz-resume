---
title: "프론트엔드 개발 짧은 팁 모음 -- RHF, 동적 import, useState, zod, Cache-Control"
date: "2025-09-16"
tags: ["React", "Tips", "TypeScript", "Cache"]
---

## RHF defaultValues는 마운트 시점에 고정된다 (2025.07.21)

React Hook Form의 `defaultValues`는 폼이 마운트될 때 내부 ref에 저장된다. 이후에 URL 파라미터가 바뀌어도 `defaultValues`는 갱신되지 않는다.

```tsx
const { control, reset } = useForm({
  defaultValues: {
    search: searchParams.get('q') || '',
  },
});

// URL이 바뀌었을 때
useEffect(() => {
  // reset()은 폼 값을 초기화하지만,
  // defaultValues 자체를 변경하지는 않는다.
  reset();
  // 의도: input을 비우고 싶음
  // 결과: defaultValues의 원래 값으로 돌아감
}, [pathname]);
```

해결: `reset()`에 새로운 값을 명시적으로 전달한다.

```tsx
reset({ search: '' });
```

## Dynamic import로 코드 분할하기 (2025.07.22)

`import()`는 모듈을 런타임에 비동기로 로드한다. 세 가지 주요 용도가 있다.

### 1. 코드 분할

```tsx
const AdvancedEditor = lazy(() => import('./AdvancedEditor'));
```

### 2. 조건부 모듈 로딩

```ts
async function loadChart(type: string) {
  if (type === 'bar') {
    const { BarChart } = await import('./charts/BarChart');
    return BarChart;
  }
  const { LineChart } = await import('./charts/LineChart');
  return LineChart;
}
```

### 3. 플러그인 시스템

```ts
async function loadPlugin(name: string) {
  const plugin = await import(`./plugins/${name}`);
  plugin.init();
}
```

## useState lazy initialization

`useState`에 함수를 전달하면 초기 렌더링에서만 실행된다.

```tsx
// 매 렌더링마다 getInitialValue() 호출 (비효율적)
const [value, setValue] = useState(getInitialValue());

// 초기 렌더링에서만 getInitialValue() 호출 (효율적)
const [value, setValue] = useState(() => getInitialValue());
```

`getInitialValue()`가 localStorage 접근이나 복잡한 계산을 포함한다면, 화살표 함수로 감싸서 불필요한 반복 실행을 방지해야 한다.

## zod superRefine으로 교차 필드 검증 (2025.08.01)

여러 필드 간의 관계를 검증할 때 `superRefine`을 사용한다.

```ts
const schema = z.object({
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  const hasCode = !!data.countryCode;
  const hasPhone = !!data.phoneNumber;

  // 둘 다 있거나 둘 다 없어야 함
  if (hasCode !== hasPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '국가 코드와 전화번호를 모두 입력하거나 모두 비워주세요.',
      path: hasCode ? ['phoneNumber'] : ['countryCode'],
    });
  }
});
```

`ctx.addIssue`의 `path`를 지정하면 에러를 특정 필드에 연결할 수 있다.

## console.log는 객체를 참조로 출력한다 (2025.08.05)

```ts
const arr = [1, 2, 3];
console.log(arr);       // 콘솔에서 펼치면 [1, 2, 3, 4]가 보임
arr.push(4);
```

`console.log`는 객체의 **참조**를 저장한다. 콘솔에서 객체를 펼치는 시점에 **현재 상태**를 보여주기 때문에, 로그 시점의 값과 다를 수 있다.

해결 방법:

```ts
// 배열 복사
console.log([...arr]);

// 객체 복사
console.log({ ...obj });

// 또는 문자열로 변환
console.log(JSON.stringify(arr));
```

## Cache-Control 헤더 정리 (2025.09.12)

### no-cache

캐시에 저장하되, **매번 서버에 유효성을 확인**한 후 사용한다.

```
요청 → 서버에 확인 → 304 Not Modified → 캐시 사용
요청 → 서버에 확인 → 200 OK (새 데이터) → 캐시 갱신
```

### no-store

캐시에 **저장하지 않는다**. 매 요청마다 서버에서 새로 받는다.

### must-revalidate

캐시가 **만료되기 전에는** 서버 확인 없이 사용한다. 만료된 후에는 반드시 서버에 확인한다.

```
Cache-Control: max-age=3600, must-revalidate
→ 1시간 동안은 캐시 사용
→ 1시간 후에는 서버에 확인 필수
```

| 값 | 캐시 저장 | 서버 확인 시점 |
|----|---------|--------------|
| no-cache | O | 매번 |
| no-store | X | 해당 없음 (항상 새로 요청) |
| must-revalidate | O | 만료 후 |

## JSON.stringify 활용 팁 (2025.09.16)

`JSON.stringify`의 두 번째, 세 번째 인자를 활용할 수 있다.

### replacer: 특정 필드만 포함

```ts
const user = { name: 'Kim', age: 30, password: '1234' };

// 특정 키만 포함
JSON.stringify(user, ['name', 'age']);
// '{"name":"Kim","age":30}'

// 함수로 필터링
JSON.stringify(user, (key, value) => {
  if (key === 'password') return undefined;
  return value;
});
// '{"name":"Kim","age":30}'
```

### space: 들여쓰기

```ts
JSON.stringify(data, null, 2);   // 2칸 스페이스
JSON.stringify(data, null, 4);   // 4칸 스페이스
JSON.stringify(data, null, '\t'); // 탭
```
