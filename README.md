# Finona Frontend

React-приложение для учёта личных финансов. Работает с [Finona Backend](../README.md).

## Возможности

- Дашборд с графиками доходов/расходов (Recharts)
- Управление счетами, транзакциями и категориями
- Бюджеты с отслеживанием лимитов
- Отчёты и админ-панель
- Аутентификация и профиль через Supabase
- Адаптивный UI, тёмная тема, SEO-метаданные

## Стек

- React 18 + TypeScript + Vite (SWC)
- TanStack Query, React Router 6, React Hook Form + Zod
- Tailwind CSS + shadcn/ui (Radix)
- Supabase JS (auth, storage)
- Vitest + Testing Library, Playwright (e2e)

## Быстрый старт

```bash
npm install
cp .env.example .env   # заполните переменные ниже
npm run dev
```

Откройте http://localhost:5173.

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `VITE_API_URL` | URL бэкенда (например, `http://localhost:8000`) |
| `VITE_SUPABASE_URL` | URL Supabase-проекта |
| `VITE_SUPABASE_ANON_KEY` | Публичный ключ Supabase |

## Требования

- Node.js >= 18
- Запущенный [бэкенд](../README.md) на `http://localhost:8000`
- Supabase-проект (для auth)

## Скрипты

```bash
npm run dev         # Dev-сервер
npm run build       # Production-сборка
npm run preview     # Превью сборки
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Unit-тесты (Vitest)
npm run test:watch  # Vitest в watch-режиме
npm run test:e2e    # Playwright e2e
```

Также доступны цели `make dev|build|lint|preview|docker-build|docker-up|docker-down`.

## Docker

```bash
make docker-up      # сборка и запуск через docker-compose
make docker-down
```

Образ собирается из `Dockerfile`, статика отдаётся через nginx (`nginx.conf`).

## Структура

```
src/
├── components/     # UI-компоненты (shadcn/ui + кастомные)
├── hooks/          # React-хуки
├── integrations/   # Supabase-клиент
├── lib/            # API-клиент, утилиты
├── pages/          # Страницы (Dashboard, Accounts, Transactions, ...)
├── test/           # Тестовые утилиты и моки
└── App.tsx         # Роутинг
e2e/                # Playwright-сценарии
supabase/           # Конфигурация и миграции Supabase
```

## Тестирование

- Unit: `npm test` (jsdom + Testing Library)
- E2E: `npm run test:e2e` — перед запуском поднимите `npm run dev`

Перед коммитом запускайте `make lint`.
