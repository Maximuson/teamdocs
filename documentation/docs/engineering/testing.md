# Тестирование

В `apps/api` подключён Vitest. Первый unit test находится в `apps/api/src/app.service.spec.ts`: он проверяет реальный `AppService` и валидирует его результат общей `healthResponseSchema`.

## Команды

```bash
# из корня проекта
npm run test

# режим наблюдения для API
npm run test:watch --workspace=@teamdocs/api
```

Root-команда перед тестами строит `@teamdocs/contracts`, потому что package exports указывают на `dist`.

## Как добавлять новый тест

1. Сначала опиши ожидаемое поведение тестом.
2. Запусти конкретный тест и убедись, что он падает по ожидаемой причине.
3. Внеси минимальное изменение в код.
4. Повтори тест, затем полный `npm run test`.
5. Перед коммитом выполни typecheck, lint и build.

Для чистой domain logic используй unit tests. Для HTTP + database границ добавляй integration tests, когда PostgreSQL и migrations появятся в коде.
