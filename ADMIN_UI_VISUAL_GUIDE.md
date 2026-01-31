# Admin Dashboard Visual Guide

## Color Palette

### Primary Colors
- **Primary Gradient**: `linear-gradient(135deg, #df600c, #f45da6)`
- **Background**: `#f8f9fa` (Light gray)
- **Card Background**: `#ffffff` (White)

### Text Colors
- **Headings**: `#212529` (Almost black)
- **Body Text**: `#495057` (Dark gray)
- **Secondary Text**: `#6c757d` (Medium gray)

### Status Colors
- **Active/Success**: `#d4edda` background, `#155724` text (Green)
- **Pending/Warning**: `#fff3cd` background, `#856404` text (Yellow)
- **Processing/Info**: `#cfe2ff` background, `#084298` text (Blue)
- **Inactive/Danger**: `#f8d7da` background, `#721c24` text (Red)

### Borders
- **Primary Border**: `#e9ecef`
- **Secondary Border**: `#dee2e6`

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                       │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│  🎰      │  Lottery Admin Dashboard                     │
│  Admin   │                                               │
│          ├───────────────────────────────────────────────┤
│──────────┤                                               │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ 📊       │  │ 🎫   │ │ 💰   │ │ 🎲   │ │ 🏆   │        │
│Dashboard │  │ 1234 │ │ 5000 │ │  25  │ │  10  │        │
│          │  │Ticket│ │ TON  │ │Draws │ │Winner│        │
│ 🎰       │  └──────┘ └──────┘ └──────┘ └──────┘        │
│Lotteries │                                               │
│          │  ┌─────────────────────────────────────┐    │
│ 🎲       │  │ Recent Activity                      │    │
│Draws     │  │                                      │    │
│          │  │ 🎫 Ticket purchased for Mega...     │    │
│ 💰       │  │ 🎫 Ticket purchased for Weekend...  │    │
│Payouts   │  │                                      │    │
│          │  └─────────────────────────────────────┘    │
│          │                                               │
│──────────┤                                               │
│          │                                               │
│ 🚪       │                                               │
│Logout    │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

## Page Screenshots (Text Description)

### 1. Login Page (`/admin/auth/login`)
```
┌────────────────────────────────────┐
│                                    │
│          🎰 Lottery Admin          │
│     Sign in to manage lotteries    │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Username                      │ │
│  │ [Enter username_________]    │ │
│  │                               │ │
│  │ Password                      │ │
│  │ [Enter password_________]    │ │
│  │                               │ │
│  │   [  Sign In →  ]            │ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```
**Features:**
- Clean, centered login form
- White card on light gray background
- Gradient button with hover effect
- Error messages display above form
- Rounded corners and subtle shadows

### 2. Dashboard Page (`/admin/dashboard`)
```
Grid of 6 statistics cards:
┌─────────┐ ┌─────────┐ ┌─────────┐
│   🎫    │ │   💰    │ │   🎲    │
│  1,234  │ │5,000 TON│ │   25    │
│ Tickets │ │  Sales  │ │  Draws  │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│   🏆    │ │   🎰    │ │   ⏳    │
│   10    │ │    5    │ │    3    │
│ Winners │ │ Active  │ │ Pending │
└─────────┘ └─────────┘ └─────────┘

Recent Activity List:
┌──────────────────────────────────────┐
│ 🎫 Ticket purchased for Mega...     │
│    10 TON | 1/31/2026 8:45 AM       │
├──────────────────────────────────────┤
│ 🎫 Ticket purchased for Weekend...  │
│    5 TON | 1/31/2026 8:30 AM        │
└──────────────────────────────────────┘
```

### 3. Lotteries Management (`/admin/lotteries`)
```
Header:
┌──────────────────────────────────────┐
│ Lottery Management  [+ Create Lottery]│
└──────────────────────────────────────┘

Lottery Cards:
┌──────────────────────────────────────┐
│ Mega Jackpot              [Edit]     │
│ mega-jackpot             [Delete]    │
│ A huge jackpot lottery...             │
│ 💰 10 TON/ticket                     │
│ 🎫 500/1000 sold                     │
│ 🏆 5,000 TON pool                    │
│ [Active] Draw: 2/1/2026              │
└──────────────────────────────────────┘

Create/Edit Form Modal:
┌──────────────────────────────────────┐
│ Create New Lottery           [X]     │
├──────────────────────────────────────┤
│ Name: [_______________]              │
│ Slug: [_______________]              │
│ Description: [_________]             │
│ Ticket Price: [___] Max: [___]       │
│ Draw Date: [___________]             │
│                                      │
│         [Cancel]  [Create]           │
└──────────────────────────────────────┘
```

### 4. Draws Management (`/admin/draws`)
```
Scheduled Draws:
┌──────────────────────────────────────┐
│ Mega Jackpot          [Execute Draw] │
│ Scheduled: 2/1/2026 9:00 PM          │
│ [Scheduled]                          │
└──────────────────────────────────────┘

Recent Draws:
┌──────────────────────────────────────┐
│ Weekend Special                      │
│ Executed: 1/30/2026 9:00 PM          │
│ [Completed]                          │
└──────────────────────────────────────┘
```

### 5. Payouts Management (`/admin/payouts`)
```
Header with Filters:
┌──────────────────────────────────────┐
│ Payout Management                    │
│ [All] [Pending] [Processing] [Done]  │
└──────────────────────────────────────┘

Payout Cards:
┌──────────────────────────────────────┐
│ Mega Jackpot          [Process]      │
│ 💰 100 TON           [Cancel]        │
│ Created: 1/31/2026 8:00 AM           │
│ [pending]                            │
└──────────────────────────────────────┘
```

## Component Styles

### Buttons

**Primary Button (Gradient)**
```css
background: linear-gradient(135deg, #df600c, #f45da6)
color: white
border-radius: 8px
padding: 0.75rem 1.5rem
hover: translateY(-2px) + shadow
```

**Secondary Button**
```css
background: #f8f9fa
border: 1px solid #dee2e6
color: #495057
border-radius: 6px
hover: background #f8f9fa
```

**Delete Button**
```css
border: 1px solid #ff6b6b
color: #c92a2a
background: white
hover: background #fff5f5
```

### Cards

**Stat Card**
```css
background: white
border: 1px solid #e9ecef
border-radius: 12px
padding: 1.5rem
text-align: center
```

**Activity Item**
```css
background: #f8f9fa
border-radius: 8px
padding: 1rem
display: flex
gap: 1rem
```

### Forms

**Input Fields**
```css
padding: 0.75rem 1rem
border: 1px solid #dee2e6
border-radius: 8px
focus: border #df600c + shadow
```

**Form Modal**
```css
background: white
border-radius: 12px
padding: 2rem
max-width: 600px
overlay: rgba(0,0,0,0.5)
```

### Navigation

**Sidebar Button**
```css
padding: 0.875rem 1.5rem
border-left: 3px solid transparent
active: background #fff5f5
active: border-left #df600c
hover: background #f8f9fa
```

**Status Badge**
```css
padding: 0.25rem 0.75rem
border-radius: 12px
font-size: 0.8rem
font-weight: 600
/* Colors vary by status */
```

## Responsive Behavior

### Desktop (> 768px)
- Sidebar: Fixed 260px width
- Main content: Margin-left 260px
- Stats grid: Auto-fit columns (min 200px)

### Mobile (< 768px)
- Sidebar: Full width, relative position
- Main content: No margin
- Stats grid: Stacks vertically

## Accessibility

- All buttons have proper labels
- Form inputs have associated labels
- Status badges use color + text
- Focus states clearly visible
- Keyboard navigation supported

## Animation & Transitions

- Button hover: `transform: translateY(-2px)`
- Focus: `box-shadow: 0 0 0 3px rgba(223, 96, 12, 0.1)`
- All transitions: `0.2s` to `0.3s` ease
- Modal appears with fade-in effect
