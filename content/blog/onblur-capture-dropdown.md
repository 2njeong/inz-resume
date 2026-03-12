---
title: "onBlurCapture와 e.preventDefault()로 드롭다운 포커스 문제 해결하기"
date: "2025-10-15"
tags: ["React", "DOM Events", "Troubleshooting", "UI"]
---

## 문제 상황

Compound Pattern으로 구현한 `DropdownSearch` 컴포넌트에서, 드롭다운을 닫는 동작이 제대로 작동하지 않는 문제가 있었다.

구조는 이렇다:

```typescript
const DropdownSearchCompounds = {
  Root,        // 전체 wrapper
  Input,       // 검색 입력
  Dropdown,    // 드롭다운 리스트
  SearchInput, // 드롭다운 내 검색
  Option,      // 옵션 항목
  // ...
};
```

Root 컴포넌트에서 `onBlurCapture`를 사용해 포커스가 Root 바깥으로 나가면 드롭다운을 닫도록 구현했다.

---

## 버그: 닫기 아이콘을 눌러도 드롭다운이 다시 열림

닫기 아이콘 클릭 시 발생하는 이벤트 흐름:

### e.preventDefault() 사용 전

```
1. 아이콘 클릭 → setIsOpen(false) 호출
2. 동시에 포커스가 아이콘으로 이동 → onBlur 발생
3. onBlurCapture에서 relatedTarget 확인
4. relatedTarget이 Root 안의 요소임 → setIsOpen(true) 다시 호출!
5. 드롭다운이 다시 열려버림
```

문제의 핵심: 아이콘 클릭 시 **포커스 이동**이 발생하고, `onBlurCapture`가 이를 "Root 안에서의 포커스 이동"으로 판단해서 드롭다운을 다시 여는 것이다.

---

## 해결: e.preventDefault()

```typescript
const handleCloseClick = (e: React.MouseEvent) => {
  e.preventDefault(); // 포커스 이동 차단!
  setIsOpen(false);
};
```

### e.preventDefault() 사용 후

```
1. 아이콘 클릭 → e.preventDefault()로 포커스 이동 차단
2. onBlur/onBlurCapture 실행 안 됨
3. setIsOpen(false) 정상 처리
4. 드롭다운 정상적으로 닫힘
```

---

## onBlurCapture vs onBlur

`onBlurCapture`는 이벤트 **캡처링 단계**에서 blur를 감지한다.

```
이벤트 흐름:
캡처링 (위 → 아래)     → onBlurCapture
                         ↓
타겟 도달              → 실제 blur 발생
                         ↓
버블링 (아래 → 위)     → onBlur
```

Root에서 `onBlurCapture`를 쓰면 **자식 요소의 blur도 Root에서 가장 먼저 감지**할 수 있다. 이를 통해 "포커스가 Root 밖으로 나갔는지"를 판단하는 것이다.

```typescript
const handleBlurCapture = (e: React.FocusEvent) => {
  const relatedTarget = e.relatedTarget as Node;
  // 포커스가 Root 밖으로 나갔으면 닫기
  if (!rootRef.current?.contains(relatedTarget)) {
    setIsOpen(false);
  }
};
```

---

## 핵심 교훈

1. **포커스 이동과 클릭 이벤트는 동시에 발생**한다 — 클릭하면 해당 요소로 포커스가 이동
2. **e.preventDefault()는 포커스 이동도 차단**한다 — mousedown에서 호출하면 포커스 변경을 막을 수 있음
3. **Compound Pattern에서 포커스 관리**는 onBlurCapture + relatedTarget 조합이 유용하지만, 닫기 버튼 같은 특수한 경우에는 preventDefault()가 필요
