# TeamDocs documentation

Самостоятельный Docusaurus site для проектной документации, архитектурных решений и учебного журнала TeamDocs.

## Независимость от приложения

Эта директория **не включена** в root npm workspaces. У сайта собственные `package.json` и `package-lock.json`; его зависимости не смешиваются с React/NestJS monorepo.

## Команды

```bash
cd documentation
npm install
npm start       # http://localhost:3002/teamdocs/
npm run typecheck
npm run build
npm run serve
```

## Структура

- `docs/` — опубликованная навигационная документация;
- `notes/drafts/` — versioned черновики, не попадающие на сайт;
- `templates/` — шаблоны ADR и learning notes;
- `src/` и `static/` — Docusaurus UI и assets.

Перед любым commit с документацией выполняй `npm run build` из этой директории.
