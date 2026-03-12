---
title: "React 모달 내 textarea 높이 자동 조절 — useEffect, useLayoutEffect, rAF의 실행 시점 이해"
date: "2025-12-19"
tags: ["React", "CSS", "Browser", "Troubleshooting"]
---

## 문제 상황

모달 안에 있는 `textarea`의 높이를 내용에 맞게 자동 조절하려고 했다.

```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
}, [content]);
```

일반적인 상황에서는 잘 동작했지만, **모달을 열었을 때 `scrollHeight`가 부정확하게 계산되는 문제**가 발생했다.

---

## 첫 번째 시도: useLayoutEffect

"페인트 전에 실행해야 하니까 `useLayoutEffect`를 써야겠다"고 생각했다.

하지만 여전히 문제 발생. 이유:

```
1. React DOM 업데이트
2. useLayoutEffect 실행 ← scrollHeight가 아직 확정되지 않음
3. 브라우저 레이아웃 계산
4. 페인트
```

`useLayoutEffect`는 **브라우저 레이아웃 계산 전**에 실행되기 때문에 `scrollHeight`가 정확하지 않았다.

---

## 핵심 발견: CSS 트랜지션과 JavaScript는 병렬로 동작한다

모달에는 보통 CSS 트랜지션이 있다 (opacity, transform 등).

```
JavaScript ──────────────────────────────────────────►
                useEffect 실행
                     ↓
                (scrollHeight 읽기 - 부정확!)

CSS 트랜지션 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━►
              시작                              완료
           (opacity: 0)                    (opacity: 1)
           (모달 크기 변화 중)              (최종 크기)
```

`useEffect`(JavaScript)가 실행될 때 CSS 트랜지션이 아직 진행 중이면, 모달의 최종 크기가 확정되지 않아 `scrollHeight`가 부정확할 수 있다.

---

## 최종 해결책: useEffect + requestAnimationFrame

```typescript
useEffect(() => {
  requestAnimationFrame(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  });
}, [content]);
```

`requestAnimationFrame`은 다음 프레임을 그리기 전에 실행된다. 이 시점에는 CSS 트랜지션이 더 진행되어 레이아웃이 안정화된 상태다.

---

## useEffect vs useLayoutEffect (with rAF)

| 조합 | 실행 흐름 |
|------|----------|
| `useLayoutEffect` + `rAF` | 페인트 전에 등록 → 다음 프레임에 실행 |
| `useEffect` + `rAF` | 페인트 후에 등록 → 다음 프레임에 실행 |

둘 다 결국 다음 프레임에 실행되지만:
- `useLayoutEffect`는 페인트를 **블로킹**한다 (동기적 실행)
- `useEffect`는 페인트를 **블로킹하지 않는다**

`requestAnimationFrame`을 쓰는 순간 어차피 다음 프레임에 실행되므로, `useLayoutEffect`로 페인트를 블로킹할 이유가 없다.

---

## 번외: CSS 트랜지션과 JavaScript를 동기화할 수는 없을까?

### transitionend 이벤트

```typescript
useEffect(() => {
  const modal = modalRef.current;
  const handleTransitionEnd = () => adjustHeight();
  modal.addEventListener('transitionend', handleTransitionEnd);
  return () => modal.removeEventListener('transitionend', handleTransitionEnd);
}, []);
```

### Web Animations API

```typescript
const animation = modal.animate(
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 300 }
);
await animation.finished;
adjustHeight();
```

**왜 기본값이 비동기인가?** 성능 때문이다. CSS 트랜지션을 기다리면 JavaScript가 300ms 동안 블로킹된다. `transform`, `opacity` 같은 속성은 GPU에서 별도 스레드로 처리되어 성능이 좋은데, 이를 분리해야 브라우저가 최적화할 수 있다.

---

## 정리

| Hook/API | 실행 시점 | 특징 |
|----------|----------|------|
| `useLayoutEffect` | 레이아웃 계산 전 | scrollHeight 부정확 가능, 페인트 블로킹 |
| `useEffect` | 페인트 후 | CSS 트랜지션 진행 중일 수 있음 |
| `requestAnimationFrame` | 다음 프레임 전 | 레이아웃이 더 안정화된 상태 |

**결론**: 모달처럼 CSS 트랜지션이 있는 요소에서 동적 높이 조절이 필요하면, `useEffect` + `requestAnimationFrame` 조합이 적합하다.
