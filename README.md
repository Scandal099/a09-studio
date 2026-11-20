# A/09 — Веб-студия

Минималистичный mobile-first сайт веб-студии A/09 в монохромной эстетике (`#0b0b0b` / `#f2f2f2`). Построен на Next.js App Router (через Vinext), React 19, TypeScript и Cloudflare D1 (Drizzle ORM).

## Архитектура

- **Шрифты:** локальные вариативные `@fontsource-variable/onest` и `@fontsource-variable/jetbrains-mono` (подключаются напрямую в `app/layout.tsx`, без внешних CDN и тяжёлых библиотек).
- **Маршруты:**
  - `/` — русская версия (`app/page.tsx`) с RU-метаданными и `hreflang`.
  - `/en` — отдельная англоязычная SSR-версия (`app/en/page.tsx`) с EN-метаданными.
  - `/privacy` — статическая страница Политики обработки персональных данных (152-ФЗ + EU GDPR).
  - `POST /api/inquiries` — приём быстрых заявок в таблицу D1 `inquiries` (`db/schema.ts`).
- **Визуал и структура:**
  - Оригинальные монохромные работы студии из `public/art` (`/art/metal.webp`, `/art/wall-wide.webp`, `/art/wall-portrait.webp`).
  - 5 лаконичных секций без текстового перегруза: Hero, Форматы с ценами, Стартовые слоты, Архитектурная пауза, Процесс + 4 коротких FAQ и Контакт.
  - Быстрая 2-полевая форма заявки (`Имя` + `Telegram / телефон / email` + опциональный комментарий + согласие 152-ФЗ/GDPR).

## Локальный запуск

Требуется Node.js 22.13 или новее:

```sh
npm ci
npm run build
```

Для новой локальной базы D1 один раз примените миграцию:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_glorious_misty_knight.sql
```

- Разработка: `npm run dev`
- Просмотр собранной версии: `npm start`
- Просмотр локальных заявок в D1:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT * FROM inquiries ORDER BY created_at DESC"
```

## Настройка перед публикацией

Весь контент, контакты и кейсы находятся в одном файле — [`studio/content.ts`](studio/content.ts):

1. **Контакты (`studioContact`):** замените `email`, `TELEGRAM_HANDLE`, `calUrl` и при желании добавьте `WHATSAPP_NUMBER` (пока строка пустая, кнопка WhatsApp скрыта).
2. **Реквизиты (`studioContact.legal`):** укажите реальные данные ИП / юрлица в `entity` и `operatorNote`.
3. **Реальные кейсы (`content.*.work.slots`):** смените у слота `status: "open"` на `status: "published"` и заполните опциональные поля `client`, `year`, `image`, `imageAlt`, `liveUrl`, `metrics`, `summary`.
