# Обзор проекта

TeamDocs — учебный full-stack проект для работы с документами. Он строится по шагам: сначала корректные границы между React-клиентом, NestJS API и shared contracts; затем PostgreSQL, авторизация, документы, поиск и AI-функции.

## Текущее рабочее вертикальное сечение

1. React/Vite запрашивает `GET /api/health`.
2. Vite в development проксирует `/api` в NestJS API на порт `3100`.
3. API формирует ответ через Zod schema из `@teamdocs/contracts`.
4. Frontend получает JSON как `unknown` и валидирует его той же runtime schema.

## Текущий стек

| Область | Выбор |
| --- | --- |
| Web | React + Vite + TypeScript |
| API | NestJS + TypeScript ESM |
| Contracts | Zod в workspace `@teamdocs/contracts` |
| Database runtime | PostgreSQL 16 в Docker Compose |
| Tests | Vitest в API workspace |
| Quality | TypeScript strict mode и Oxlint |
| Documentation | Docusaurus в `documentation/` |

PostgreSQL уже запускается в Compose, но application-level ORM, migrations и модели ещё не реализованы.
