---
title: "브라우저 렌더링 파이프라인과 React 렌더링의 관계 — requestAnimationFrame의 위치"
date: "2025-09-05"
tags: ["Browser", "React", "Performance", "requestAnimationFrame"]
---

## 브라우저 렌더링 파이프라인

브라우저가 화면을 그리는 과정은 다음과 같다:

```
1. JavaScript 실행
2. Style 계산 (CSS 적용)
3. Layout 계산 (위치/크기)
4. Paint (픽셀 그리기)
5. Composite (화면에 표시)
→ requestAnimationFrame 콜백 실행
→ 다시 1번으로...
```

`requestAnimationFrame`(rAF)은 **다음 프레임을 그리기 직전**에 실행된다. 이 시점은 이전 프레임의 레이아웃이 완료된 상태이므로, DOM 요소의 크기나 위치를 정확히 읽을 수 있다.

---

## React 렌더링과 브라우저의 관계

React의 렌더링은 브라우저의 렌더링과 별개의 개념이다:

### 1. Render Phase (React)
- 컴포넌트 함수 실행
- JSX → Virtual DOM 생성
- `useState`, `useRef` 실행
- `useEffect`는 **등록만** 함 (실행 아님)

### 2. Commit Phase (React)
- Virtual DOM → Real DOM 반영
- `ref.current` 할당

### 3. Browser Paint (브라우저)
- 브라우저가 변경된 DOM을 화면에 그림

### 4. Effect Execution
- `useEffect` 콜백 실행

---

## Hook별 실행 시점 비교

```
React Render Phase
    ↓
React Commit Phase (DOM 업데이트)
    ↓
useLayoutEffect 실행 ← 여기! (페인트 전, 동기적)
    ↓
Browser Layout 계산
    ↓
Browser Paint
    ↓
useEffect 실행 ← 여기! (페인트 후, 비동기적)
    ↓
requestAnimationFrame 콜백 ← 여기! (다음 프레임 전)
```

### useLayoutEffect

- **페인트 전**에 동기적으로 실행
- DOM 조작이 화면에 반영되기 전에 처리해야 할 때 사용
- 예: `scrollIntoView`, 레이아웃 계산

### useEffect

- **페인트 후**에 비동기적으로 실행
- 사이드 이펙트(API 호출, 구독 등)에 적합
- 화면 깜빡임 가능성 있음 (DOM 조작 시)

### requestAnimationFrame

- **다음 프레임 직전**에 실행
- 애니메이션, 정확한 레이아웃 읽기에 적합
- CSS 트랜지션이 진행 중인 요소의 크기를 읽을 때 유용

---

## 실전 활용 예시

### 스크롤 위치 조정

```typescript
useLayoutEffect(() => {
  // 페인트 전에 스크롤 이동 → 깜빡임 없음
  ref.current?.scrollIntoView({ behavior: 'instant' });
}, [dependency]);
```

### 정확한 요소 크기 읽기

```typescript
useEffect(() => {
  requestAnimationFrame(() => {
    // 레이아웃이 안정화된 시점에서 크기 읽기
    const height = ref.current?.getBoundingClientRect().height;
  });
}, [dependency]);
```

### 애니메이션

```typescript
const animate = () => {
  // 매 프레임마다 실행 (60fps = 약 16.7ms 간격)
  position.current += velocity;
  element.style.transform = `translateX(${position.current}px)`;
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);
```

---

## 정리

| API | 실행 시점 | 동기/비동기 | 주요 용도 |
|-----|----------|-----------|----------|
| `useLayoutEffect` | 페인트 전 | 동기 | 깜빡임 없는 DOM 조작 |
| `useEffect` | 페인트 후 | 비동기 | 사이드 이펙트 |
| `requestAnimationFrame` | 다음 프레임 전 | 비동기 | 애니메이션, 정확한 레이아웃 읽기 |

브라우저 렌더링 파이프라인을 이해하면, **어떤 Hook/API를 언제 써야 하는지** 자연스럽게 판단할 수 있다.
