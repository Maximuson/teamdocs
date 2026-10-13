---
sidebar_label: Contracts и Zod
---

# Shared contracts и Zod

`packages/contracts` — единственный источник runtime schemas для общих API-форматов. Backend использует schema, чтобы сформировать корректный ответ; frontend использует ту же schema, чтобы проверить непроверенный JSON.

## Правило границы

```ts
const payload: unknown = await response.json();
const result = healthResponseSchema.safeParse(payload);

if (!result.success) {
  throw new Error('API returned an invalid health response');
}
```

`unknown` — честный тип для данных, пришедших из сети. Не заменяй его на `as HealthResponse`: assertion не валидирует данные во время выполнения.

## Где читать подробности

Полное практическое руководство перенесено в [Zod: runtime validation](./zod). Оно описывает schemas, `z.infer`, ошибки, forms, environment variables, API и внешние AI responses.
