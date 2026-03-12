---
title: "JSON.stringify의 숨겨진 파라미터 — replacer와 space 활용법"
date: "2025-09-16"
tags: ["JavaScript", "JSON", "Tips"]
---

## JSON.stringify 시그니처

```typescript
JSON.stringify(value, replacer?, space?)
```

대부분 `JSON.stringify(obj)`로만 사용하지만, 2번째와 3번째 파라미터가 유용한 경우가 많다.

---

## replacer: 속성 필터링

### 배열로 전달 — 특정 속성만 포함

```javascript
const user = { name: '홍길동', age: 25, password: '1234', email: 'test@test.com' };

JSON.stringify(user, ['name', 'email']);
// '{"name":"홍길동","email":"test@test.com"}'
```

민감한 정보를 제외하고 직렬화할 때 유용하다.

### 함수로 전달 — 값 변환

```javascript
JSON.stringify(user, (key, value) => {
  if (key === 'password') return undefined; // 제외
  if (typeof value === 'string') return value.toUpperCase(); // 변환
  return value;
});
// '{"name":"홍길동","age":25,"email":"TEST@TEST.COM"}'
```

`undefined`를 반환하면 해당 속성이 결과에서 제외된다.

---

## space: 들여쓰기

```javascript
// 숫자: 공백 개수
JSON.stringify(obj, null, 2);
/*
{
  "name": "홍길동",
  "age": 25
}
*/

// 문자열: 해당 문자로 들여쓰기
JSON.stringify(obj, null, '\t');
/*
{
	"name": "홍길동",
	"age": 25
}
*/
```

디버깅이나 로그 출력 시 가독성을 높일 때 사용한다.

---

## 실전 활용

```javascript
// 로그에 보기 좋게 출력
console.log(JSON.stringify(apiResponse, null, 2));

// 민감 정보 제외 후 저장
localStorage.setItem('user', JSON.stringify(user, ['name', 'email', 'role']));

// 날짜 변환
JSON.stringify(data, (key, value) => {
  if (value instanceof Date) return value.toISOString();
  return value;
});
```
