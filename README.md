# A/09 — Лендинги для локального бизнеса

Минималистичный монохромный сайт (`#0b0b0b` / `#f2f2f2`) с фокусом на мобильные устройства, локальный малый бизнес в одном городе, только лендинги и работу по самозанятости (НПД).

> Предыдущая полная B2B-версия (с корпоративными форматами, CRM/CMS и ИП) сохранена в отдельной папке `C:\Users\Doklo\a06\a09-studio-b2b-saved` и в git-теге `v-b2b-full`.

## Архитектура
- **Стек:** Next.js 16 (App Router) + React 19 + TypeScript + `Onest Variable` & `JetBrains Mono Variable` (без `Inter`).
- **Маршруты:** `/` (RU), `/en` (EN), `/privacy` (152-ФЗ + GDPR), `/api/inquiries` (локальный/Cloudflare серверный приём заявок + автоматический статический переход в Telegram/почту на GitHub Pages).

## Что заменить перед запуском рекламы
Все контакты, цены и кейсы лежат в одном файле `studio/content.ts`:
1. `TELEGRAM_HANDLE`, `email`, `WHATSAPP_NUMBER` (пустой номер скрывает кнопку WhatsApp).
2. `studioContact.legal` — ваши ФИО и статус самозанятого для политики `/privacy`.
3. `work.slots` — когда появится первый реальный проект, поменяйте `status: "open"` на `"published"` и добавьте скриншот/ссылку.

## Команды
- `npm run dev` — локальная разработка (`http://localhost:5173`)
- `npm run lint` — проверка ESLint
- `npm run build` — сборка
