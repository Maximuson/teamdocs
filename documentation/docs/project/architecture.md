# Архитектура

```text
Browser
  │
  ▼
React + Vite (apps/web, :5173)
  │  /api proxy
  ▼
NestJS API (apps/api, :3100)
  │
  ├── @teamdocs/contracts (packages/contracts)
  │
  └── PostgreSQL 16 (Compose; integration pending)
```

## Границы

- `apps/web` отвечает за browser UI и не должен содержать API runtime-логику.
- `apps/api` отвечает за HTTP, domain logic и будущую работу с persistence.
- `packages/contracts` содержит переносимые Zod schemas и inferred types для границ данных.
- `documentation` независима от всех этих workspace-пакетов и публикуется отдельно.

## Основное правило

TypeScript type исчезает во время выполнения. Поэтому на HTTP, environment, forms, файлах и внешних AI-ответах используются Zod schemas, а не type assertions.
