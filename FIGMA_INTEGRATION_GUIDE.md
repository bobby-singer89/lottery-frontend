# 🎨 Figma Integration Guide for Weekend Millions

## Как работать с Figma дизайнами / How to work with Figma designs

### 📋 Содержание / Table of Contents
1. [Получение доступа к дизайнам](#getting-access)
2. [Экспорт дизайн-токенов](#design-tokens)
3. [Экспорт ассетов](#exporting-assets)
4. [Плагины для разработки](#figma-plugins)
5. [Workflow Figma → Code](#workflow)
6. [Текущая дизайн-система](#current-design)

---

## 🔑 Получение доступа к дизайнам / Getting Access {#getting-access}

### Способ 1: Прямая ссылка на Figma
1. Откройте файл Figma с дизайнами Weekend Millions
2. Нажмите "Share" в правом верхнем углу
3. Скопируйте ссылку и поделитесь с командой
4. Разработчики могут просматривать файл в режиме "View only"

### Способ 2: Inspect Mode (Dev Mode)
- В Figma включите **Dev Mode** (справа сверху)
- Это даст доступ к:
  - CSS/Tailwind код
  - Размерам и отступам
  - Цветам в разных форматах
  - Ассетам для экспорта

---

## 🎨 Экспорт дизайн-токенов / Design Tokens Export {#design-tokens}

### Использование Figma Tokens Plugin

1. **Установите плагин "Figma Tokens"**
   ```
   Plugins → Browse plugins in Community → Search "Figma Tokens"
   ```

2. **Экспорт токенов**
   - Откройте плагин
   - Выберите "Export"
   - Формат: JSON
   - Сохраните как `design-tokens.json`

3. **Пример структуры токенов:**
   ```json
   {
     "colors": {
       "primary": {
         "purple": "#8b5cf6",
         "pink": "#ec4899"
       },
       "neon": {
         "glow": "rgba(167, 139, 250, 0.5)"
       }
     },
     "spacing": {
       "xs": "0.25rem",
       "sm": "0.5rem",
       "md": "1rem"
     },
     "typography": {
       "h1": {
         "size": "3rem",
         "weight": "800"
       }
     }
   }
   ```

---

## 📦 Экспорт ассетов / Exporting Assets {#exporting-assets}

### Логотипы и иконки

1. **Выберите элемент в Figma**
2. **Export settings** (справа внизу):
   - Format: SVG (для векторной графики)
   - Format: PNG @2x (для растровых изображений)
   - Format: WebP (для оптимизации)

3. **Экспортируйте в папку:**
   ```
   /public/images/
   /src/assets/icons/
   ```

### Пример экспорта для NewMainScreen:
```bash
# Логотип W
/public/images/logo-w.svg

# Фоновые паттерны
/public/images/particles-bg.svg

# Иконки навигации
/src/assets/icons/home.svg
/src/assets/icons/profile.svg
```

---

## 🔌 Рекомендуемые Figma плагины / Figma Plugins {#figma-plugins}

### Для разработчиков:

1. **Figma to Code (HTML, Tailwind, React)**
   - Автоматическая генерация React компонентов
   - Поддержка Tailwind CSS
   - Использование: Select element → Plugins → Figma to Code

2. **Design Tokens**
   - Экспорт цветов, шрифтов, отступов
   - JSON/CSS формат

3. **Iconify**
   - Библиотека иконок
   - Интеграция с lucide-react (уже используется в проекте)

4. **Stark** (Accessibility)
   - Проверка контрастности
   - Accessibility рекомендации

---

## 🔄 Workflow: Figma → Code {#workflow}

### Шаг 1: Анализ дизайна
```
1. Открыть Dev Mode в Figma
2. Изучить:
   - Структуру компонентов
   - Spacing/padding значения
   - Цветовую палитру
   - Типографику
   - Анимации (если есть)
```

### Шаг 2: Извлечение параметров

**Пример для карточки лотереи:**

Из Figma Dev Mode:
```
Card:
  Width: 288px (18rem)
  Height: 380px
  Border Radius: 24px (rounded-3xl)
  Background: Linear gradient
  Padding: 24px (p-6)
  
Colors:
  Purple: #8b5cf6
  Pink: #ec4899
  Glow: rgba(139, 92, 246, 0.6)
```

Перевод в Tailwind:
```tsx
<div className="w-72 h-[380px] rounded-3xl p-6">
  <div style={{
    background: `linear-gradient(135deg, #8b5cf620, #8b5cf605)`
  }}>
    {/* content */}
  </div>
</div>
```

### Шаг 3: Создание компонента

```tsx
// 1. Создайте файл компонента
// src/components/LotteryCard.tsx

// 2. Импортируйте дизайн-токены
import { COLORS, SPACING } from '@/config/design-tokens';

// 3. Реализуйте дизайн
export function LotteryCard({ color, title, jackpot }) {
  return (
    <motion.div
      className="w-72 h-[380px] rounded-3xl"
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}05)`,
        boxShadow: `0 0 60px ${color}60`
      }}
    >
      {/* ... */}
    </motion.div>
  );
}
```

---

## 🎨 Текущая дизайн-система / Current Design System {#current-design}

### Цвета / Colors

```typescript
// Primary Colors (из NewMainScreen.tsx)
const colors = {
  purple: {
    main: '#8b5cf6',      // Purple-600
    light: '#a78bfa',     // Purple-400
    dark: '#7c3aed',      // Purple-700
  },
  pink: {
    main: '#ec4899',      // Pink-500
    light: '#f472b6',     // Pink-400
  },
  yellow: '#eab308',      // Yellow-500
  green: '#22c55e',       // Green-500
  cyan: '#06b6d4',        // Cyan-500
  rose: '#f43f5e',        // Rose-500
};
```

### Typography

```css
/* Заголовки */
h1: text-4xl md:text-6xl font-extrabold
h2: text-3xl font-bold
h3: text-xl font-bold

/* Текст */
body: text-base
small: text-sm text-xs
```

### Spacing

```css
/* Container padding */
px-4 (1rem)
py-3 (0.75rem)

/* Gap между элементами */
gap-2 (0.5rem)
gap-3 (0.75rem)
gap-8 (2rem)
```

### Компоненты

#### Header
```tsx
Height: 4rem (h-16)
Backdrop blur: backdrop-blur-xl
Background: bg-black/40
Border: border-b border-white/10
```

#### Cards
```tsx
Width: 18rem (w-72)
Height: 380px (h-[380px])
Border radius: rounded-3xl
Shadow: shadow-2xl
```

#### Buttons
```tsx
Pills: rounded-full
Primary: bg-gradient-to-r from-purple-600 to-pink-600
Secondary: bg-black/50
```

---

## 📝 Как добавить новый дизайн из Figma / Adding New Design from Figma

### Метод 1: Копирование стилей вручную

1. Откройте компонент в Figma Dev Mode
2. Выберите "CSS" или "Tailwind" в инспекторе
3. Скопируйте классы
4. Адаптируйте под React/Tailwind синтаксис

**Пример:**
```
Figma CSS:
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  
React/Tailwind:
  className="bg-gradient-to-br from-purple-600 to-pink-600"
```

### Метод 2: Использование Figma to Code

1. Выберите frame/component
2. Plugins → Figma to Code
3. Выберите "React + Tailwind"
4. Копируйте код
5. Адаптируйте под структуру проекта

### Метод 3: Figma API (автоматизация)

```bash
# Установите Figma API клиент
npm install figma-api

# Создайте скрипт для извлечения дизайна
# scripts/figma-sync.js
```

```javascript
const Figma = require('figma-api');
const figma = new Figma.Api({
  personalAccessToken: process.env.FIGMA_TOKEN
});

async function fetchDesign() {
  const file = await figma.getFile('YOUR_FILE_KEY');
  // Process and generate design tokens
}
```

---

## 🔧 Настройка дизайн-токенов в проекте / Setup Design Tokens

### Создайте файл конфигурации:

```typescript
// src/config/design-tokens.ts

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      purple: '#8b5cf6',
      pink: '#ec4899',
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
    },
    lottery: {
      draw: '#8b5cf6',
      keno: '#a78bfa',
      momentum: '#f43f5e'
    },
    background: {
      dark: '#000000',
      darkPurple: 'rgb(88, 28, 135)', // purple-950
      glass: 'rgba(0, 0, 0, 0.4)'
    }
  },
  
  spacing: {
    header: '4rem',
    footer: '80px',
    cardGap: '80px'
  },
  
  animation: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  },
  
  shadows: {
    neon: (color: string) => `0 0 60px ${color}60, 0 0 100px ${color}30`,
    card: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }
};
```

### Использование в компонентах:

```tsx
import { DESIGN_TOKENS } from '@/config/design-tokens';

function LotteryCard({ color }) {
  return (
    <div style={{
      boxShadow: DESIGN_TOKENS.shadows.neon(color)
    }}>
      {/* ... */}
    </div>
  );
}
```

---

## 📊 Чек-лист внедрения дизайна / Design Implementation Checklist

- [ ] Получен доступ к Figma файлу
- [ ] Изучены все артборды и компоненты
- [ ] Извлечены цвета и добавлены в design-tokens
- [ ] Извлечена типографика (шрифты, размеры)
- [ ] Экспортированы все иконки и изображения
- [ ] Определены breakpoints для адаптива
- [ ] Реализованы анимации по Figma спецификации
- [ ] Проверена доступность (contrast ratio)
- [ ] Компоненты протестированы на разных экранах

---

## 🚀 Быстрый старт / Quick Start

### Если у вас есть Figma ссылка:

1. **Поделитесь ссылкой:**
   ```
   https://www.figma.com/file/YOUR_FILE_ID/Weekend-Millions
   ```

2. **Укажите конкретные артборды:**
   ```
   - Main Screen
   - Lottery Cards
   - Navigation
   ```

3. **Я создам компоненты на основе дизайна**

### Если дизайна еще нет:

1. Текущая реализация уже создана в `src/pages/NewMainScreen.tsx`
2. Можно экспортировать существующий дизайн в Figma
3. Или уточнить требования для доработки

---

## 💡 Полезные ссылки / Useful Links

- [Figma for Developers](https://www.figma.com/developers)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma Tokens Plugin](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens)
- [Tailwind CSS from Figma](https://www.figma.com/community/plugin/738806869514947558/Tailwind-CSS)

---

## 📞 Следующие шаги / Next Steps

**Пожалуйста, предоставьте:**
1. ✅ Ссылку на Figma файл (если есть)
2. ✅ Конкретные экраны/компоненты для реализации
3. ✅ Приоритетные изменения в текущем дизайне

**Или:**
- Опишите что именно не устраивает в текущей реализации `/new-home`
- Какие элементы нужно изменить
- Какие референсы использовать

---

## 🎯 Текущая реализация / Current Implementation

### Страница: `/new-home`

**Компоненты:**
- ✅ Header с TON/USDT переключателем
- ✅ Анимированный фон с частицами
- ✅ 3D карусель с 5 карточками
- ✅ Табы категорий (Draw, Keno, Momentum)
- ✅ Bottom navigation с центральной кнопкой Profile
- ✅ Touch swipe поддержка

**Что можно улучшить:**
- Точная цветовая схема из Figma
- Анимации переходов
- Микроинтеракции
- Дополнительные визуальные эффекты
- Адаптивная верстка под разные устройства

---

**Готов помочь с интеграцией Figma дизайна! Просто предоставьте ссылку или опишите требования. 🚀**
