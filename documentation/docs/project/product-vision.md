# Product vision: финальный TeamDocs

## Назначение

TeamDocs — multi-user приложение, в котором команда хранит внутренние документы, управляет доступом к ним и получает ответы на вопросы по разрешённой базе знаний. Продукт объединяет обычную работу с документами и AI-поиск, но AI не становится отдельным хранилищем правды: источником всегда остаются сами документы и их права доступа.

## Для кого

| Роль | Задача в продукте |
| --- | --- |
| Участник команды | Находит документы, читает разрешённые материалы и задаёт вопросы по ним. |
| Автор документа | Создаёт, редактирует, публикует и архивирует документы. |
| Администратор workspace | Управляет участниками, ролями и правилами доступа. |
| Система | Индексирует разрешённые документы, строит retrieval context, показывает источники и фиксирует технические события. |

## Что пользователь сможет сделать

### 1. Войти и работать в своём workspace

- зарегистрироваться и войти;
- безопасно завершить сессию;
- работать только в разрешённой организации/workspace;
- иметь роль с понятным набором прав;
- не видеть пользователей, документы и AI-результаты другого workspace.

### 2. Управлять документами

- создавать документ с заголовком, содержимым, статусом и метаданными;
- редактировать и сохранять изменения;
- публиковать, архивировать и восстанавливать документ в рамках разрешений;
- загружать поддерживаемые файлы, когда file storage будет реализован;
- видеть список документов с pagination, filters и search;
- открывать один документ по стабильному identifier.

### 3. Управлять доступом

- назначать роли участникам workspace;
- предоставлять и отзывать доступ по правилам RBAC;
- проверять доступ на API boundary, а не только скрывать кнопку во frontend;
- вести audit trail важных действий: создание, изменение, публикация, удаление/архивирование и изменение ролей.

### 4. Находить знания

- искать документы по названию, тексту и метаданным;
- получать AI-ответ на вопрос только по документам, доступным текущему пользователю;
- видеть ссылки на документы и фрагменты, из которых сформирован ответ;
- понимать, когда система не нашла достаточно подтверждённого контекста, вместо уверенного выдуманного ответа.

### 5. Получать надёжный AI-результат

AI-flow будет разделён на явные этапы:

```text
Документ → extraction → chunks → embeddings → indexed knowledge
Вопрос пользователя → authorization scope → retrieval → LLM answer + citations
```

Перед retrieval система определяет workspace и права пользователя. В retrieval context попадают только разрешённые chunks. Ответ возвращается вместе с citations, а evaluation dataset измеряет качество поиска и ответов.

## Как будут работать основные сценарии

### Сценарий: создание и публикация документа

1. Автор проходит authentication.
2. API определяет текущий workspace и роль пользователя.
3. Клиент отправляет данные формы в API.
4. API валидирует входные данные, применяет authorization и сохраняет документ в PostgreSQL.
5. Действие попадает в audit trail.
6. После публикации документ становится доступен тем, кому разрешён его visibility level.
7. Если документ участвует в knowledge base, система ставит indexing job в очередь.

### Сценарий: поиск и чтение

1. Пользователь открывает список документов своего workspace.
2. API применяет pagination, filters и access policy.
3. Пользователь ищет или открывает документ.
4. API повторно проверяет право на конкретный resource.
5. Frontend показывает данные либо controlled empty/error state.

### Сценарий: вопрос к базе знаний

1. Пользователь задаёт вопрос внутри workspace.
2. API проверяет session, membership, role и rate limit.
3. AI service получает вопрос и строго ограниченный scope разрешённых документов.
4. Retrieval выбирает релевантные chunks только из этого scope.
5. Модель формирует ответ на основе context.
6. API возвращает answer, citations, retrieval metadata и понятный fallback, если evidence недостаточно.
7. Технические метрики и стоимость вызова записываются для observability и budget control.

## Целевая архитектура

```text
React web application
        │
        ▼
NestJS API
  ├── authentication + RBAC
  ├── document domain + audit trail
  ├── PostgreSQL / migrations
  ├── Redis / jobs / rate limits
  └── HTTP boundary to AI service
        │
        ▼
FastAPI AI service
  ├── ingestion and chunking
  ├── embeddings and retrieval
  ├── answer generation with citations
  ├── evaluation
  └── cost and quality telemetry
```

`@teamdocs/contracts` остаётся общей границей API-форматов. Каждый внешний вход — HTTP body, environment, file metadata, webhook или AI provider response — валидируется в runtime до использования.

## Functional roadmap

### Foundation — сделано

- [x] React frontend и NestJS API в npm workspaces.
- [x] Shared contracts package и проверяемый `GET /api/health` path.
- [x] Docker Compose с PostgreSQL volume.
- [x] API unit-test foundation через Vitest.
- [x] Отдельная Docusaurus documentation service.

### MVP documents — следующий продуктовый этап

- [ ] Application database client, migrations и health check connection.
- [ ] User, workspace и membership data model.
- [ ] Registration, login, logout, session/refresh flow.
- [ ] RBAC guards и policy checks.
- [ ] Document CRUD API с validation, pagination и status lifecycle.
- [ ] Document list/detail UI и controlled error states.
- [ ] Integration tests для API + PostgreSQL.
- [ ] Audit trail для критичных изменений.

### Knowledge search and AI

- [ ] File upload/storage strategy и supported-document extraction.
- [ ] Background indexing jobs and retry policy.
- [ ] Chunking, embeddings и vector persistence.
- [ ] Scoped retrieval, который не обходит RBAC.
- [ ] AI question UI, answer API и citations.
- [ ] Evaluation dataset и regression checks качества.
- [ ] Quotas, budgets, rate limits и AI observability.

### Production readiness

- [ ] CI checks для application и documentation builds.
- [ ] Structured logging, metrics и error tracking.
- [ ] Backup/restore procedure для PostgreSQL.
- [ ] Security review: secrets, headers, CORS, abuse prevention и permission boundaries.
- [ ] Staging deployment, release procedure и demo scenario.

## Границы scope

На первом MVP не нужно строить всё сразу. Не начинаем с полнотекстового поиска, file formats, Redis, vector database или LLM provider, пока не доказан обычный document flow: identity → permission → CRUD → database tests.

Каждая новая функция считается готовой, только когда есть:

1. понятный контракт и runtime validation на границе;
2. authorization, если функция читает или меняет пользовательские данные;
3. интерфейс с loading, empty и error states;
4. автоматическая проверка поведения;
5. документация: команды запуска, ограничения и принятые решения.
