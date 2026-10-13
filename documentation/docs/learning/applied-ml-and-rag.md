# 30 · Applied ML & RAG Academy

Цель: создать AI-модуль, который отвечает по документам с контролируемым retrieval, источниками, evaluation и ограничениями безопасности/расходов.

Планируемые этапы: ingestion → chunks → embeddings → scoped retrieval → ответ с citations → evaluation dataset → наблюдаемость, quotas и fallback behavior.

AI-функция не должна обходить авторизацию TeamDocs: retrieval scope обязан учитывать пользователя, tenant и права доступа до передачи контекста модели.
