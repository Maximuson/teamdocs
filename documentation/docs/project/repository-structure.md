# Структура репозитория

```text
teamdocs/
├── apps/
│   ├── api/                 # NestJS API
│   └── web/                 # React + Vite application
├── packages/
│   └── contracts/           # Zod schemas + inferred TypeScript types
├── documentation/           # самостоятельный Docusaurus site
│   ├── docs/                # опубликованная документация
│   ├── notes/drafts/        # черновики, не попадающие в сайт
│   └── templates/           # шаблоны заметок и ADR
├── docker/                  # Nginx configuration
├── compose.yaml
└── README.md
```

`documentation/` намеренно не добавлен в root npm workspaces. Это предотвращает случайное связывание зависимостей сайта с application lockfile и позволяет запускать документацию независимо.
