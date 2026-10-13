---
sidebar_label: 'ADR-0001 · npm workspaces'
---

# ADR-0001 · npm workspaces для application monorepo

- **Статус:** принято
- **Дата:** 2026-10-11

## Контекст

TeamDocs содержит React web app, NestJS API и shared contracts. Нужен простой package manager и monorepo workflow для обучения.

## Решение

Используем npm workspaces в root `package.json` для `apps/*` и `packages/*`.

## Последствия

- npm входит в Node.js и не требует отдельного инструмента для старта.
- Root `package-lock.json` фиксирует application dependency graph.
- `documentation/` сознательно не является workspace: у неё самостоятельный lockfile и lifecycle.
- Позже pnpm или другой manager оценивается только при реальной технической потребности.
