---
title: "Zod superRefine으로 cross-field 유효성 검사 구현하기"
date: "2025-09-01"
tags: ["TypeScript", "Zod", "Validation", "Form"]
---

## 문제

환자 정보 스키마에서, 국가코드와 전화번호가 **모두 있거나 모두 없어야** 하는 조건이 필요했다. 개별 필드의 `.optional()` 만으로는 이런 cross-field 검증이 불가능하다.

---

## superRefine 활용

```typescript
const patientSchema = z.object({
  name: z.string().min(1),
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  const hasCountryCode = !!data.countryCode;
  const hasPhoneNumber = !!data.phoneNumber;

  if (hasCountryCode !== hasPhoneNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '국가코드와 전화번호를 모두 입력하거나 모두 비워주세요.',
      path: hasCountryCode ? ['phoneNumber'] : ['countryCode'],
    });
  }
});
```

### superRefine vs refine

```typescript
// refine: 단순 boolean 반환
.refine((data) => data.a > data.b, { message: "a must be greater than b" })

// superRefine: ctx.addIssue()로 여러 에러를 추가 가능
.superRefine((data, ctx) => {
  if (!condition1) ctx.addIssue({ ... });
  if (!condition2) ctx.addIssue({ ... });
})
```

`superRefine`은 **여러 필드에 걸친 복잡한 유효성 검사**에서 각 필드별로 개별 에러 메시지를 설정할 수 있어 유용하다.

---

## 핵심

- 개별 필드 검증: `.min()`, `.max()`, `.email()` 등
- 필드 간 검증: `.superRefine()` 또는 `.refine()`
- 여러 에러를 동시에 반환해야 하면 `superRefine` 사용
