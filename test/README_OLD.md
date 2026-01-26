# Weekend Millions Lottery - React + TypeScript + Vite

Криптовалютная лотерея нового поколения на блокчейне TON.

## 🎮 Новые функции

Это приложение было значительно расширено новыми компонентами и функциями! Для просмотра всех новых возможностей откройте `/demo` страницу.

### ✨ Геймификация

- **PlayerLevel** - Система уровней игрока (Bronze → Silver → Gold → Diamond → Platinum)
  - Визуализация текущего уровня с градиентными иконками
  - Прогресс-бар с анимацией заполнения
  - XP система с отображением прогресса
  - Список преимуществ для каждого уровня

- **StreakCounter** - Счетчик дней подряд
  - Визуализация streak с огоньками 🔥
  - История последних 7 дней
  - Награды за достижение 7, 14, 30 дней streak
  - Анимация пульсации при активном streak

- **DailyQuests** - Ежедневные задания
  - Список заданий с прогресс-барами
  - Награды в TON за выполнение
  - Таймер до обновления заданий
  - Анимация выполнения с галочками

- **AchievementBadges** - Коллекция достижений
  - Сетка значков (открытые и закрытые)
  - Модальное окно с деталями достижения
  - Конфетти при клике на открытое достижение
  - Прогресс до следующего достижения

### 📊 Живая статистика

- **LivePrizeCounter** - Анимированный счетчик призового фонда
  - Эффект "крутящихся цифр" как в слот-машине
  - Форматирование с разделителями
  - Пульсация при обновлении значения
  - Live обновления (mock данные)

- **CountdownTimer** - Таймер обратного отсчета
  - Формат: дни, часы, минуты, секунды
  - Flip-эффект при изменении цифры
  - Критическое время: красный цвет когда < 1 часа
  - Конфетти при завершении

### 💫 Анимации

- **ParticleBackground** - Фоновые частицы
  - Падающие монеты TON, звезды и блестки
  - Canvas-based анимация
  - Настраиваемое количество частиц
  - Опция включения/выключения

- **SkeletonLoader** - Skeleton loaders
  - Для карточек лотерей
  - Для списков
  - Для таблицы лидеров
  - Shimmer-эффект

### 👥 Социальные функции

- **Leaderboard** - Таблица лидеров
  - Топ-10 игроков
  - Особые иконки для 1, 2, 3 места (золото, серебро, бронза)
  - Подсветка текущего пользователя
  - Табы: Неделя, Месяц, Всё время

### 🔊 Звуковые эффекты

- **SoundManager** - Система звуков
  - Web Audio API для генерации звуков
  - Звуки: клик, покупка, выигрыш, проигрыш, повышение уровня, достижение
  - Настройки громкости
  - Сохранение в localStorage

### 🌐 Мультиязычность

- **i18n** интеграция
  - Поддержка русского (по умолчанию) и английского
  - react-i18next
  - Сохранение выбора языка в localStorage

## 📦 Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Линтинг
npm run lint
```

## 🛣️ Маршруты

- `/` - Главная страница с лотереями
- `/demo` - Демонстрация всех новых компонентов

## 🏗️ Структура проекта

```
src/
├── components/
│   ├── Gamification/         # Компоненты геймификации
│   │   ├── PlayerLevel.tsx
│   │   ├── StreakCounter.tsx
│   │   ├── DailyQuests.tsx
│   │   └── AchievementBadges.tsx
│   ├── Animations/           # Анимационные компоненты
│   │   ├── ParticleBackground.tsx
│   │   └── SkeletonLoader.tsx
│   ├── Statistics/           # Статистика
│   │   ├── LivePrizeCounter.tsx
│   │   └── CountdownTimer.tsx
│   ├── Social/               # Социальные функции
│   │   └── Leaderboard.tsx
│   ├── Advanced/             # Продвинутые функции
│   │   └── SoundManager.tsx
│   └── [существующие компоненты]
├── pages/
│   └── DemoPage.tsx          # Демо-страница
├── locales/                  # Переводы
│   ├── ru.json
│   └── en.json
└── i18n.ts                   # Конфигурация i18n
```

## 🎨 Технологии

- React 19
- TypeScript
- Vite
- Framer Motion - анимации
- i18next - мультиязычность
- canvas-confetti - конфетти
- react-router-dom - маршрутизация
- TON Connect UI - интеграция с кошельком

## 📝 Заметки

- Все новые компоненты добавлены БЕЗ изменения существующего кода
- Bundle size: ~842 KB (264 KB gzipped)
- Все компоненты используют TypeScript для типобезопасности
- Полностью адаптивный дизайн для мобильных устройств
- Темная тема по умолчанию

## 🚀 Будущие улучшения

- MyTicketsCarousel - Карусель билетов с 3D эффектами
- WinningsChart - График выигрышей с recharts
- ActivityFeed - Лента активности
- ReferralQR - QR-код для реферальной программы
- FloatingCoins - 3D анимация монет
- GlitchText - Киберпанк глитч-эффекты
- PWA поддержка с офлайн режимом

---

## React + TypeScript + Vite - Technical Details

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
