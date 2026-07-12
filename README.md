# Hidden Mascot Horror Archive

Первая рабочая версия локального каталога малоизвестных mascot horror игр на React + Vite + TypeScript.

## Что уже есть

- Главная страница с hero-блоком, статистикой, подборками и быстрым входом в рулетку.
- Каталог с поиском, сортировкой, фильтрами и активными тегами.
- Страницы игры, разработчика, серии, списка пользователя и отдельной рулетки.
- Сохранение отметок и истории в `localStorage`.
- Адаптивная верстка для ПК, планшета и телефона.
- SEO-основа: `title`, `description`, `favicon`, `robots.txt`, `sitemap.xml`, fallback для GitHub Pages.
- Локальная организация изображений из архива `Фото для ИГР.zip`.
- Unit-тесты для чистой логики рулетки.

## Стек

- React
- Vite
- TypeScript
- React Router
- CSS без тяжелых UI-библиотек

## Как запустить

```bash
npm install
npm run organize:assets
npm run dev
```

## Сборка

```bash
npm run build
```

## Публикация

В проекте используется `BrowserRouter` с `public/404.html`, чтобы маршруты вроде `/games/:slug`, `/series/:slug` и `/roulette` работали на GitHub Pages.

Перед публикацией можно задать базовый путь:

```bash
npm run build
```

Для GitHub Pages в PowerShell:

```powershell
$env:VITE_BASE_PATH = '/repo-name/'
npm run build
```

Если деплой идет в корень домена, переменная не нужна.

## Скрипт ассетов

Скрипт `scripts/organize-assets.mjs`:

- распаковывает архив `C:\Прочее\Фото для ИГР.zip`;
- распознает изображения по имени файла;
- копирует их в `public/assets/games/<slug>/cover`, `hero`, `gallery`;
- нераспознанные файлы отправляет в `public/assets/unsorted`;
- обновляет `src/data/asset-report.json`.

## Результат распознавания

На текущем архиве скрипт обработал:

- 89 изображений;
- 21 распознанную игру;
- 1 нераспознанный файл.

### Не распознано

- `Garten Of Munke.png`

### Потребуют ручной проверки

- `PLAYTIME.Co  THE HOUR OF JOY DEMO1.png -> the-hour-of-joy`
- `PLAYTIME.Co  THE HOUR OF JOY DEMO2.png -> the-hour-of-joy`
- `PLAYTIME.Co  THE HOUR OF JOY DEMO3.png -> the-hour-of-joy`
- `PLAYTIME.Co  THE HOUR OF JOY DEMO4.png -> the-hour-of-joy`
- `Poppy Playtime Chapter 0 — An Unknown Fall.png -> an-unknown-fall`

## Примечания по данным

- Если информация о рейтинге, цене, статусе или разработчике не подтверждена, в интерфейсе используется `Не указано`, `Требует проверки` или `Не проверено`.
- Оценки в этой версии считаются предварительными, если они не подтверждены полноценной проверкой gameplay.
- История рулетки хранится локально в браузере.

## Файлы, которые добавлены или обновлены

- `src/App.tsx`
- `src/main.tsx`
- `src/types.ts`
- `src/data/library.ts`
- `src/data/asset-report.json`
- `src/pages/*`
- `src/components/*`
- `src/hooks/*`
- `src/utils/*`
- `scripts/organize-assets.mjs`
- `public/404.html`
- `public/robots.txt`
- `public/sitemap.xml`

## Команды

- `npm run dev`
- `npm run build`
- `npm run deploy`
- `npm test`
- `npm run organize:assets`
