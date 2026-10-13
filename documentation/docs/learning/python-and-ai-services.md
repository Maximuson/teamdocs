# 20 · Python & AI Services Academy

Цель: построить отдельный FastAPI service для data- и AI-задач, не размывая ответственность NestJS API.

Будущая граница: NestJS остаётся application API и владельцем доступа/прав, FastAPI отвечает за специализированные Python/AI workflows. Обмен должен идти по явно описанному HTTP contract, а ответ внешних сервисов необходимо валидировать на runtime boundary.
