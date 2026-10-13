# TeamDocs

Учебный full-stack монорепозиторий для будущего приложения работы с документами. Проект развивается небольшими проверяемыми шагами: React-клиент, NestJS API, общие contracts, PostgreSQL, затем поиск и AI-функции.

> Это foundation проекта, а не завершённый продукт. Сейчас реализован и проверен первый путь: browser → API → shared contract.

## Документация

Подробная инженерная документация, архитектурные решения и учебный журнал находятся в отдельном Docusaurus-сайте: [`documentation/`](documentation/README.md).

```bash
cd documentation
npm install
npm start
```

Документация запускается отдельно от основного приложения на `http://localhost:3002/teamdocs/`.

## Быстрый старт

### Требования

- Node.js 20 или новее;
- npm;
- Docker Desktop — только для Compose-окружения.

### Установка

```bash
npm install
```

### Запуск в development

Открой два терминала из корня репозитория.

```bash
npm run dev:api
```

```bash
npm run dev:web
```

После запуска:

| Сервис | Адрес |
| --- | --- |
| Frontend | `http://localhost:5173` |
| API | `http://localhost:3100` |
| API health | `http://localhost:3100/api/health` |

Проверка API:

```bash
curl http://localhost:3100/api/health
```

## Проверки качества

Перед commit выполни:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Docker Compose

Compose поднимает frontend, API и PostgreSQL с persistent named volume.

```bash
cp .env.example .env
npm run docker:up
```

Остановить сервисы, не удаляя данные PostgreSQL:

```bash
npm run docker:down
```

Полные инструкции по портам, volume и режимам запуска находятся в [документации Docker Compose](documentation/docs/engineering/docker-compose.md).

## Структура

```text
teamdocs/
├── apps/
│   ├── api/                 # NestJS API
│   └── web/                 # React + Vite application
├── packages/
│   └── contracts/           # shared API contracts
├── documentation/           # самостоятельный Docusaurus site
├── docker/                  # Nginx configuration
├── compose.yaml
└── README.md
```

## Текущее состояние

Работает первый вертикальный сценарий: frontend обращается к `GET /api/health` через Vite proxy, API возвращает проверенный shared contract, а UI обрабатывает loading, ready и error states.

Следующие продуктовые этапы: PostgreSQL integration и migrations, CRUD документов, authentication/RBAC, затем отдельный Python/AI service и RAG.

## Где искать информацию

| Вопрос | Документ |
| --- | --- |
| Архитектура и границы сервисов | [Project architecture](documentation/docs/project/architecture.md) |
| Локальная разработка и команды | [Local development](documentation/docs/engineering/local-development.md) |
| Contracts и проверка данных на границах | [Contracts](documentation/docs/engineering/contracts-and-zod.md) |
| Тестирование | [Testing](documentation/docs/engineering/testing.md) |
| Docker и PostgreSQL volume | [Docker Compose](documentation/docs/engineering/docker-compose.md) |
| Принятые технические решения | [ADRs](documentation/docs/decisions/README.md) |
| Учебный путь и личные заметки | [Learning path](documentation/docs/learning/path.md) |

## Правило документации

README остаётся короткой точкой входа: что это за репозиторий, как его запустить и где найти нужную информацию. Долговременные инструкции, решения и учебные заметки добавляй в `documentation/`.
