---
sidebar_label: 'ADR-0002 · NestJS ESM'
---

# ADR-0002 · NestJS API использует ESM

- **Статус:** принято
- **Дата:** 2026-10-11

## Контекст

Новый проект использует современный Node.js и Vite. Требовалась согласованная module system для NestJS API.

## Решение

API остаётся ESM: `"type": "module"`, `module: "NodeNext"` и `moduleResolution: "NodeNext"`. Relative runtime imports в TypeScript указывают emitted `.js` extension.

## Последствия

- Меньше несогласованности между современным tooling и server runtime.
- Нельзя бездумно копировать CommonJS examples: import paths и tools должны быть ESM-compatible.
- Тесты используют такой же relative import style, например `./app.service.js`.
