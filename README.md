# A/09 Digital Studio

Одностраничный сайт независимой студии. Интерфейс написан на React и TypeScript с маршрутизацией Next.js App Router через Vinext. Стили и шрифт Inter поставляются с сайтом. GSAP и ScrollTrigger загружаются отдельно от первого экрана.

## Локальный запуск

Требуется Node.js 22.13 или новее. Из каталога проекта выполните:

```sh
npm ci
npm run build
```

В новой локальной базе один раз примените миграцию:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_glorious_misty_knight.sql
```

Для разработки запустите `npm run dev`. Для просмотра готовой сборки выполните `npm start` и откройте адрес, который выведет команда.

## Контент и контакты

В `studio/content.ts` находятся концептуальные кейсы, услуги, этапы работы, адрес почты и массив социальных ссылок. Пустые контакты скрыты. Графика лежит в `public/art`. Исходные изображения стены и плаката выделены из предоставленного референса. Для полноэкранной сцены подготовлен отдельный широкий кадр.

Кнопка **Start a project** открывает форму. Сервер проверяет бриф, записывает его в таблицу D1 `inquiries` и возвращает номер заявки. Через инструменты Sites владелец может прочитать строки этой таблицы. Уведомления по электронной почте требуют подключения почтового сервиса.

Локальная и размещённая базы независимы. Локальные заявки доступны командой:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT * FROM inquiries ORDER BY created_at DESC"
```

## Исходные файлы

- `app/studio.tsx` собирает секции и настраивает движение при прокрутке.
- `studio/hero.tsx` содержит навигацию и переключение визуальных сцен.
- `studio/dialogs.tsx` отвечает за просмотр кейсов и отправку брифа.
- `app/globals.css` задаёт токены, сетку, адаптивные состояния и режим уменьшенного движения.
- `app/api/inquiries/route.ts` обрабатывает запросы формы. Схема хранится в `db/schema.ts`.

Идентификатор проекта Sites и привязка D1 указаны в `.openai/hosting.json`. При публикации Sites применяет миграции к размещённой базе.
