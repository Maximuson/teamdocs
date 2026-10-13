# Zod в TeamDocs: runtime-валидация и TypeScript-типы

Этот документ — практическая памятка по использованию Zod в TeamDocs.

Главное правило:

> **TypeScript проверяет код до запуска. Zod проверяет реальные данные во время запуска.**

TypeScript-типы исчезают после компиляции. Поэтому они не могут проверить HTTP JSON, переменные окружения, форму пользователя, `localStorage`, webhook или ответ AI-провайдера.

---

## Содержание

- [Базовая модель](#базовая-модель)
- [Когда нужен Zod](#когда-нужен-zod)
- [Когда достаточно TypeScript](#когда-достаточно-typescript)
- [Schema и тип из schema](#schema-и-тип-из-schema)
- [Правило для API-контрактов](#правило-для-api-контрактов)
- [Примеры](#примеры)
  - [HTTP request в NestJS](#http-request-в-nestjs)
  - [HTTP response в React](#http-response-в-react)
  - [Переменные окружения](#переменные-окружения)
  - [Формы](#формы)
  - [Внешние сервисы, AI и webhooks](#внешние-сервисы-ai-и-webhooks)
  - [localStorage и файлы](#localstorage-и-файлы)
- [`parse` и `safeParse`](#parse-и-safeparse)
- [`z.infer`, `z.input` и `z.output`](#zinfer-zinput-и-zoutput)
- [Что хранить в `@teamdocs/contracts`](#что-хранить-в-teamdocscontracts)
- [Антипаттерны](#антипаттерны)
- [Чек-лист перед merge](#чек-лист-перед-merge)

---

## Базовая модель

Одна Zod schema выполняет две роли:

1. **Runtime validator** — реально проверяет значение.
2. **Источник TypeScript-типа** — TypeScript выводит тип из schema.

```ts
import { z } from 'zod';

export const documentSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
  updatedAt: z.iso.datetime(),
});

export type DocumentSummary = z.infer<typeof documentSummarySchema>;
```

- `documentSummarySchema` существует в итоговом JavaScript и может валидировать реальные данные.
- `DocumentSummary` существует только для TypeScript и исчезает после сборки.

Следствие: `DocumentSummary` сам по себе **не защищает** приложение от некорректного JSON.

---

## Когда нужен Zod

Используй schema на **границе доверия** — там, где значение пришло не из уже проверенного TypeScript-кода.

| Источник данных | Нужна schema? | Почему |
|---|---:|---|
| HTTP request body | Да | Клиент может отправить любой JSON. |
| HTTP response | Да | Сервер, прокси или старый релиз могут вернуть неверную форму. |
| Query params и route params | Да | Это строки из URL, а не готовые числа/UUID. |
| `process.env` | Да | Значения являются строками или `undefined`. |
| HTML-форма | Да | Пользовательский ввод недоверен. |
| `localStorage` | Да | Значения могут быть старыми, повреждёнными или вручную изменёнными. |
| Файл, CSV, импорт | Да | Формат файла — внешний контракт. |
| Webhook | Да | Внешний сервис не является типобезопасным. |
| AI provider / structured output | Да | Модель и провайдер могут вернуть неполную или неверную структуру. |
| Результат БД | Часто | Особенно полезно на границе repository → domain/API. |

---

## Когда достаточно TypeScript

Внутри уже проверенного кода schema на каждом шаге не нужна.

```ts
type SortDirection = 'asc' | 'desc';

function buildSort(direction: SortDirection) {
  return { updatedAt: direction };
}
```

Здесь `direction` создаётся внутри typed code. Нет HTTP, пользовательского ввода или внешнего JSON — обычного TypeScript-типа достаточно.

Используй простой `type`/`interface`, когда тип описывает внутреннюю деталь UI или алгоритма и не является runtime-контрактом:

```ts
type ModalState =
  | { kind: 'closed' }
  | { kind: 'create-document' }
  | { kind: 'delete-document'; documentId: string };
```

Такой state не нужно переносить в `@teamdocs/contracts`: он принадлежит только React UI.

---

## Schema и тип из schema

Базовый шаблон TeamDocs:

```ts
import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
```

Использование:

```ts
const parsed = createDocumentSchema.safeParse(rawValue);

if (!parsed.success) {
  // parsed.error содержит структурированное описание ошибок
  throw new Error('Некорректные данные');
}

const input: CreateDocumentInput = parsed.data;
```

После успешного parse `parsed.data` уже имеет тип `CreateDocumentInput`.

Не нужно писать ручное приведение:

```ts
// Плохо: TypeScript поверит, но runtime ничего не проверит.
const input = rawValue as CreateDocumentInput;
```

---

## Правило для API-контрактов

Если форма данных пересекает границу между frontend и API, schema и тип должны жить в:

```text
packages/contracts/src/index.ts
```

Клиент и сервер импортируют их через package name:

```ts
import {
  documentSummarySchema,
  type DocumentSummary,
} from '@teamdocs/contracts';
```

Не импортируй contracts через относительный путь к исходникам:

```ts
// Плохо: обход package boundary.
import { documentSummarySchema } from '../../../packages/contracts/src/index.ts';
```

Правильный процесс:

1. Создать schema в `@teamdocs/contracts`.
2. Вывести type через `z.infer`.
3. Собрать contracts: `npm run build --workspace=@teamdocs/contracts`.
4. Валидировать данные на API/client boundary.
5. Использовать inferred type внутри приложения.

---

## Примеры

### HTTP request в NestJS

Request body из `@Body()` нельзя считать корректным только потому, что frontend написан на TypeScript.

```ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import {
  createDocumentSchema,
  type CreateDocumentInput,
} from '@teamdocs/contracts';

@Controller('api/documents')
export class DocumentsController {
  @Post()
  create(@Body() body: unknown) {
    const parsed = createDocumentSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: CreateDocumentInput = parsed.data;

    return {
      title: input.title,
      contentLength: input.content.length,
    };
  }
}
```

Здесь:

- `body: unknown` честно отражает недоверенный источник;
- `safeParse` не бросает исключение;
- `parsed.data` становится безопасным `CreateDocumentInput`;
- controller передаёт в service уже проверенные данные.

Для больших приложений можно сделать общий NestJS pipe, который принимает Zod schema и выполняет parse до controller. Но сначала важно понимать явную версию выше.

---

### HTTP response в React

В TeamDocs уже используется этот подход для health endpoint.

```ts
import {
  healthResponseSchema,
  type HealthResponse,
} from '@teamdocs/contracts';

async function requestHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch('/api/health', { signal });
  const body: unknown = await response.json();
  const parsed = healthResponseSchema.safeParse(body);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  if (!parsed.success) {
    throw new Error('API returned a response that violates the shared contract');
  }

  return parsed.data;
}
```

Проверяем **две разные вещи**:

1. `response.ok` — HTTP-статус успешен.
2. `parsed.success` — JSON соответствует контракту.

`200 OK` не доказывает, что JSON имеет ожидаемые поля.

---

### Переменные окружения

`process.env` хранит только строки или `undefined`. Zod может преобразовать и проверить их на старте приложения.

```ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3100),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
});

export type AppEnv = z.output<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);
```

Если `PORT="3100"`, `z.coerce.number()` превратит строку в число. После `parse` тип `env.PORT` — `number`, а не `string | undefined`.

Не используй `as string` для secrets и URL:

```ts
// Плохо: приложение упадёт позже и с менее понятной ошибкой.
const databaseUrl = process.env.DATABASE_URL as string;
```

---

### Формы

Frontend-валидация нужна для понятного UX, но API обязан повторить проверку: HTTP-клиент можно обойти.

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

const result = loginSchema.safeParse({ email, password });

if (!result.success) {
  const errors = result.error.flatten().fieldErrors;
  // Покажите errors.email и errors.password рядом с полями формы.
  return;
}

const input: LoginInput = result.data;
```

Если используется React Hook Form, позже schema можно подключить через Zod resolver. Но resolver не отменяет обязательную server validation.

---

### Внешние сервисы, AI и webhooks

Ответ AI-провайдера, платёжного сервиса или webhook должен считаться `unknown` до schema parse.

```ts
import { z } from 'zod';

export const aiAnswerSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(
    z.object({
      documentId: z.uuid(),
      chunkId: z.uuid(),
    }),
  ),
});

export type AiAnswer = z.infer<typeof aiAnswerSchema>;

const raw: unknown = await providerResponse.json();
const result = aiAnswerSchema.safeParse(raw);

if (!result.success) {
  throw new Error('AI provider returned an invalid structured response');
}

const answer: AiAnswer = result.data;
```

Для будущего RAG-модуля также проверяй:

- формат citations;
- наличие document/chunk ID;
- ограничения длины строк и массивов;
- статус организации/tenant;
- отсутствие неожиданных полей, если контракт требует строгой формы.

---

### localStorage и файлы

`localStorage` — не база типов. Старый релиз приложения или пользователь могут записать туда что угодно.

```ts
import { z } from 'zod';

const draftSchema = z.object({
  title: z.string(),
  content: z.string(),
  updatedAt: z.iso.datetime(),
});

const text = localStorage.getItem('document-draft');
const raw: unknown = text === null ? null : JSON.parse(text);
const parsed = draftSchema.safeParse(raw);

if (parsed.success) {
  console.log(parsed.data.title);
} else {
  localStorage.removeItem('document-draft');
}
```

Для файлов сначала безопасно прочитай текст/JSON, затем проверь schema. Не доверяй расширению файла или имени файла.

---

## `parse` и `safeParse`

### `schema.parse(value)`

`parse` возвращает валидные данные или **бросает исключение**.

```ts
const config = envSchema.parse(process.env);
```

Подходит, когда невалидные данные означают, что приложение вообще нельзя запускать:

- env configuration;
- обязательный server startup config;
- внутренний invariant, который действительно должен прервать выполнение.

### `schema.safeParse(value)`

`safeParse` никогда не бросает из-за validation failure. Он возвращает result object.

```ts
const result = createDocumentSchema.safeParse(body);

if (!result.success) {
  return result.error.flatten();
}

return result.data;
```

Подходит, когда ошибка — нормальная часть пользовательского потока:

- формы;
- HTTP request от клиента;
- response API;
- webhook;
- импорт файла.

Практическое правило:

| Контекст | Обычно использовать |
|---|---|
| Startup env | `parse` |
| API request | `safeParse` или validation pipe |
| API response на клиенте | `safeParse` |
| Форма | `safeParse` |
| Внутренний жёсткий invariant | `parse` |

---

## `z.infer`, `z.input` и `z.output`

### `z.infer<typeof schema>`

Самый частый вариант. Для большинства schemas он равен `z.output<typeof schema>`.

```ts
const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

type User = z.infer<typeof userSchema>;
```

### `z.input<typeof schema>`

Тип значения **до** parse/transformation.

### `z.output<typeof schema>`

Тип значения **после** parse/transformation.

Это важно для преобразований:

```ts
const portSchema = z.coerce.number().int().positive();

type PortInput = z.input<typeof portSchema>;
type PortOutput = z.output<typeof portSchema>;
```

До parse порт может быть строкой из env. После parse — это число.

```ts
const rawPort: PortInput = '3100';
const port: PortOutput = portSchema.parse(rawPort);
```

Для env config предпочтительно явно писать `z.output`, чтобы подчеркнуть: это уже нормализованная и проверенная конфигурация.

---

## Что хранить в `@teamdocs/contracts`

### Хорошие кандидаты

```ts
// API response
export const documentSummarySchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
  updatedAt: z.iso.datetime(),
});

// API request
export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000),
});

// Shared API error shape
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
});
```

### Не добавляй туда

```ts
// Не contracts: UI-only state
export type ModalState = { /* ... */ };

// Не contracts: Nest provider
@Injectable()
export class DocumentsService {}

// Не contracts: ORM entity с внутренними полями
export class DocumentEntity {
  internalSearchVector: unknown;
}
```

Если код не является публичным договором между пакетами, он должен остаться рядом со слоем, которому принадлежит.

---

## Антипаттерны

### 1. `as SomeType` вместо validation

```ts
// Плохо
const document = (await response.json()) as DocumentSummary;
```

```ts
// Хорошо
const raw: unknown = await response.json();
const result = documentSummarySchema.safeParse(raw);

if (!result.success) {
  throw new Error('Invalid document response');
}

const document = result.data;
```

### 2. Только schema без выведенного типа

```ts
// Работает, но неудобно: type дублируется вручную.
const schema = z.object({ title: z.string() });
type Document = { title: string };
```

```ts
// Хорошо: один источник правды.
const schema = z.object({ title: z.string() });
type Document = z.infer<typeof schema>;
```

### 3. Только TypeScript type на API boundary

```ts
// Плохо: тип не существует в runtime.
type CreateDocumentInput = { title: string };
```

Когда данные приходят извне, сначала нужна schema.

### 4. Проверять только frontend-форму

Frontend validation улучшает UX, но не защищает API. NestJS обязан валидировать request body самостоятельно.

### 5. Схема для каждого внутреннего объекта

Не нужно вызывать Zod на каждом локальном объекте внутри trusted typed code. Это добавляет шум и лишнюю runtime-работу. Используй schema на границах доверия.

### 6. Смешивать domain entity и transport DTO

Database entity, API response и UI model могут быть разными объектами. Не экспортируй сущность БД напрямую как API-контракт только потому, что поля сейчас похожи.

---

## Чек-лист перед merge

Перед тем как добавить новый endpoint или внешний integration, проверь:

- [ ] Есть ли внешние/недоверенные данные? Если да — есть ли Zod schema?
- [ ] Schema живёт в `@teamdocs/contracts`, если контракт нужен и client, и server?
- [ ] Type получен через `z.infer<typeof schema>` или `z.output<typeof schema>`, а не продублирован вручную?
- [ ] API request body валидируется до вызова service?
- [ ] API response, если он читается клиентом, валидируется на client boundary?
- [ ] `response.json()` объявлен как `unknown` до validation?
- [ ] Нет `as SomeDto` как способа обхода ошибки?
- [ ] Нет React-only и Nest-only деталей в contracts?
- [ ] Выполнены `npm run lint`, `npm run typecheck`, `npm run build`?

---

## Короткая памятка

```text
Данные пришли извне?
├── Да → schema.parse/safeParse
│   └── После успеха используй z.infer<typeof schema>
└── Нет, это внутренний typed code → обычный TypeScript type/interface
```

Для TeamDocs это правило будет применяться к API, PostgreSQL boundary, auth tokens, file imports, env config, AI/RAG responses и любым интеграциям.
