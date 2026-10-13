# Docker Compose

`compose.yaml` поднимает три независимых сервиса приложения:

| Service | Назначение | Host port |
| --- | --- | --- |
| `web` | собранный Vite frontend через Nginx | `5173` |
| `api` | NestJS API | `3100` |
| `postgres` | PostgreSQL 16 | внутренний Compose network |

## Команды

```bash
npm run docker:up
npm run docker:down
npm run docker:logs
```

PostgreSQL использует named volume `teamdocs_postgres_data`, поэтому данные переживают пересоздание контейнера. Удаление volume — отдельное необратимое действие и не должно выполняться для обычного `docker:down`.

Документация не включена в Compose: это самостоятельный Docusaurus service, который запускается из `documentation/`. Такое разделение сохраняет простой цикл правок и не заставляет сайт документации зависеть от API, frontend или PostgreSQL.
