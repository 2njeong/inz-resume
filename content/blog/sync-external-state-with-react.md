---
title: "리액트와 외부 라이브러리 상태 동기화 — useSyncExternalStore 설계 과정"
date: "2025-11-15"
tags: ["React", "Architecture", "useSyncExternalStore", "State Management"]
---

## 문제

ProseMirror 기반 에디터(TipTap)의 상태를 React 컴포넌트에서 사용하는데, 값이 변경되어도 React가 리렌더링되지 않았다.

```
"ProseMirror의 editor.isActive('bold')를 React 컴포넌트에서 사용하는데,
값이 변경되어도 React가 리렌더링되지 않습니다.
onTransaction으로 강제 리렌더링하면 모든 트랜잭션마다 발생해서 성능이 나쁩니다."
```

**핵심 문제**: 외부 객체(ProseMirror)의 변경을 React의 렌더링 사이클과 효율적으로 동기화해야 함.

---

## 아키텍처 설계

여러 옵션을 비교 검토했다:

| 옵션 | 장점 | 단점 | 결정 |
|------|------|------|------|
| Context + useState | 간단함 | 모든 구독자가 같이 리렌더링 | X |
| forceUpdate | 직접적 | 모든 트랜잭션마다 리렌더링 | X |
| **useSyncExternalStore** | **React 18 표준, 선택적 구독** | 복잡함 | **O** |
| Redux/Zustand | 생태계 풍부 | 추가 의존성, 오버킬 | X |

설계 원칙:
- **Single Responsibility**: 상태 관리, React 통합, 에디터 인스턴스 관리를 분리
- **Performance First**: 캐싱, 메모이제이션 적극 활용
- **Type Safety**: 제네릭으로 selector 타입 추론

---

## 핵심 컴포넌트: EditorStateManager

```typescript
class EditorStateManager<TEditor extends Editor | null> {
  private editor: TEditor;
  private subscribers: Set<() => void>;  // 구독자 목록
  private transactionNumber: number;     // 버전 번호
  private lastSnapshot: Snapshot | null; // 캐시
  private lastTransactionNumber: number; // 캐시 키
}
```

### 왜 Set을 사용했나?

```typescript
// 대안 A: 단일 callback → Strict Mode에서 중복 구독 시 덮어씀
// 대안 B: 배열 → 중복 제거 어려움, 삭제 O(n)
// 선택 C: Set → 중복 자동 제거, 삭제 O(1)
private subscribers: Set<() => void>;
```

### 왜 transactionNumber인가?

`getSnapshot`이 매 렌더링마다 호출되는데, 매번 새 객체를 생성하면 무한 리렌더링이 발생한다. 버전 번호로 캐싱해서 해결:

```typescript
getSnapshot() {
  if (this.lastTransactionNumber === this.transactionNumber) {
    return this.lastSnapshot; // 캐시 반환 (참조 동일)
  }
  const snapshot = { transactionNumber: this.transactionNumber };
  this.lastSnapshot = snapshot;
  this.lastTransactionNumber = this.transactionNumber;
  return snapshot;
}
```

---

## watch 메서드: ProseMirror와 React의 브릿지

```typescript
watch(editor: Editor | null) {
  this.editor = editor;
  if (!editor) return undefined;

  const handleTransaction = () => {
    this.transactionNumber += 1;           // 버전 증가
    this.subscribers.forEach(cb => cb());  // React에 알림
  };

  editor.on('transaction', handleTransaction);
  return () => editor.off('transaction', handleTransaction);
}
```

---

## 문제 발생: 무한 리렌더링

볼드 처리를 해보니 `useSyncExternalStoreWithSelector` 내부에서 새로운 snapshot 객체가 반환되면서 setState가 계속 발생하여 무한 리렌더링이 돌았다.

**해결: selector 패턴 도입**

모든 transaction마다 리렌더링하는 대신, 특정 속성이 변경될 때만 리렌더링:

```typescript
const editorState = useEditorState({
  editor,
  selector: ({ editor }) => ({
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic')
  })
});
```

내부적으로 3단계 필터링 시스템을 적용:

1. **Shallow Compare**: 이전 snapshot과 현재 snapshot 비교
2. **Selector**: 전체 상태에서 필요한 부분만 추출
3. **Equality Check**: 이전 selector 결과와 현재 결과를 비교, 같으면 이전 참조 반환

```typescript
function useSyncExternalStoreWithSelector(
  subscribe, getSnapshot, _, selector, isEqual
) {
  const prevSelectionRef = useRef(null);

  const wrappedGetSnapshot = () => {
    const fullSnapshot = getSnapshot();
    const selectedValue = selector(fullSnapshot);

    if (prevSelectionRef.current !== null) {
      if (isEqual(prevSelectionRef.current, selectedValue)) {
        return prevSelectionRef.current; // 리렌더링 안 함!
      }
    }

    prevSelectionRef.current = selectedValue;
    return selectedValue; // 리렌더링!
  };

  return useSyncExternalStore(subscribe, wrappedGetSnapshot);
}
```

---

## 사고 과정 정리

1. ProseMirror 변화로 React 리렌더링을 유발하려면 **비교할 기준**이 필요하다
2. `useState`의 초기값을 함수형으로 선언해 리렌더링에도 인스턴스가 초기화되지 않게 한다
3. transaction 이벤트마다 구독된 콜백 함수로 상태 업데이트를 유발한다
4. `transactionNumber`로 캐싱해 불필요한 snapshot 생성을 방지한다
5. **selector로 특정 속성만 감시**해 모든 transaction이 아닌 실제 변경 시에만 리렌더링한다

---

## 배운 교훈

- **레이어 분리의 중요성**: EditorStateManager(상태 추적) + useEditorState(React 통합)을 분리하면 각각 독립적으로 테스트·최적화 가능
- **캐싱이 핵심**: getSnapshot의 참조 동일성이 깨지면 무한 리렌더링 발생
- **구독 패턴의 복잡성**: 단순해 보이지만 Strict Mode, Concurrent Mode, cleanup 순서 등 고려할 것이 많다
- **React 18의 `useSyncExternalStore`**: 외부 상태와 React 동기화의 표준 해법
