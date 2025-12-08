# Finona Frontend

React-приложение для учёта личных финансов. Работает с [Finona Backend](../README.md).

## Возможности

- Дашборд с графиками доходов/расходов
- Управление счетами и транзакциями
- Категории расходов и доходов
- Бюджеты с отслеживанием лимитов
- Профиль и настройки пользователя

## Технологии

- React 18 + TypeScript
- Vite
- TanStack Query
- Tailwind CSS + shadcn/ui
- Recharts

## Быстрый старт

```bash
npm install
npm run dev
```

Приложение: http://localhost:5173

## Требования

- Node.js >= 18
- Запущенный [бэкенд](../README.md) на http://localhost:8000

## Скрипты

```bash
npm run dev      # Разработка
npm run build    # Сборка
npm run preview  # Превью сборки
npm run lint     # Проверка кода
```

## Структура

```
src/
├── components/     # UI компоненты
├── hooks/          # React hooks
├── lib/            # API клиент и утилиты
├── pages/          # Страницы приложения
└── App.tsx         # Роутинг
```
