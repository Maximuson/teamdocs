# Локальная разработка

## Основное приложение

Из корня репозитория:

```bash
npm install
npm run dev:api
npm run dev:web
```

- API: `http://localhost:3100/api/health`
- Web: `http://localhost:5173`

В отдельном терминале запускай каждую команду: API и Vite — долгоживущие development процессы.

## Документация

Документация не использует root workspaces:

```bash
cd documentation
npm install
npm start
```

Docusaurus работает на порту `3002`, поэтому не конфликтует с API (`3100`) и Vite (`5173`).

## Проверки

Основное приложение:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Документация:

```bash
cd documentation
npm run typecheck
npm run build
```

Сборка документации намеренно падает при несуществующей внутренней ссылке: это защищает навигацию от устаревших страниц.
