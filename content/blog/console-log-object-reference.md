---
title: "console.log는 객체의 '참조'를 기록한다 — 디버깅 시 주의할 점"
date: "2025-08-05"
tags: ["JavaScript", "Debugging", "Browser"]
---

## 현상

```javascript
const arr = [1, 2, 3];
console.log(arr);
arr.push(4);
console.log(arr);
```

콘솔에서 두 로그를 펼쳐보면, **둘 다 `[1, 2, 3, 4]`로 표시**되는 경우가 있다.

---

## 원인: 지연된 평가 (Lazy Evaluation)

`console.log`는 객체의 **메모리 주소(참조)**만 기록한다. DevTools에서 펼칠 때 **현재 시점의 값**을 보여준다.

```
console.log(arr)  → arr의 참조 기록 (스냅샷 아님!)
arr.push(4)       → arr 변경
DevTools에서 펼침  → 현재 arr 상태를 보여줌 = [1, 2, 3, 4]
```

크롬 DevTools에서 "Value below was evaluated just now" 경고가 보이는 이유가 이것이다.

---

## 해결: 정확한 시점의 값 확인하기

### 방법 1: 복사본 로깅

```javascript
console.log([...arr]);           // 배열 복사
console.log({ ...obj });         // 객체 얕은 복사
console.log(structuredClone(obj)); // 깊은 복사
```

### 방법 2: JSON.stringify

```javascript
console.log(JSON.stringify(arr));
// "[1,2,3]" → 문자열이므로 참조 문제 없음
```

### 방법 3: 원시값으로 변환

```javascript
console.log(arr.length);   // 숫자 → 참조 문제 없음
console.log(obj.name);     // 문자열 → 참조 문제 없음
```

---

## 핵심

- `console.log`는 **스냅샷이 아니라 참조**를 기록한다
- DevTools는 **펼치는 시점의 현재 상태**를 보여준다
- 정확한 디버깅이 필요하면 **복사본**이나 **JSON.stringify**를 사용하자
