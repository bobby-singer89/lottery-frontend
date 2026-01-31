# Enhanced User Profile with Swipeable Glassmorphism Cards

## Overview

This implementation adds a mobile-first user profile page with 6 swipeable glassmorphism cards displaying comprehensive lottery statistics, achievements, activity, favorite numbers, earnings, and recent tickets.

## Features Implemented

### Backend API Endpoints

Created 6 new API endpoints under `/api/user/profile/`:

1. **GET /api/user/profile/stats** - User's lottery statistics
   - Total tickets bought
   - Number of wins
   - Total TON won/spent
   - Net profit/loss
   - Member since date

2. **GET /api/user/profile/achievements** - Unlockable achievements
   - First Steps (buy first ticket)
   - Collector (buy 10 tickets)
   - Lucky Beginner (first win)
   - Big Winner (win 100+ TON)
   - Progress tracking for incomplete achievements

3. **GET /api/user/profile/activity?days=30** - Activity chart data
   - Daily ticket purchase counts
   - Win statistics over time
   - Summary metrics

4. **GET /api/user/profile/favorite-numbers** - Most picked numbers
   - Top 5 frequently selected numbers
   - Pick frequency counts
   - Quick pick functionality

5. **GET /api/user/profile/earnings** - Financial breakdown
   - Total spent
   - Total won
   - Referral earnings
   - Net profit (positive UX messaging)

6. **GET /api/user/profile/recent-tickets?limit=6** - Recent tickets
   - Last N tickets with full details
   - Status: won/pending/no match
   - Winning numbers highlighting

### Frontend Components

Created 6 reusable card components in `src/components/profile/`:

- **JourneyCard.tsx** - Main stats overview with 3 metrics
- **AchievementsCard.tsx** - Achievement list with progress bars
- **ActivityCard.tsx** - CSS-based bar chart for 30-day activity
- **FavoriteNumbersCard.tsx** - Top 5 numbers with quick pick button
- **EarningsCard.tsx** - Financial breakdown with total profit
- **RecentTicketsCard.tsx** - Last 2 tickets with match highlighting

### Profile Page

Completely redesigned `src/pages/ProfilePage.tsx`:

- ✅ Horizontal swipe navigation using `react-swipeable`
- ✅ 6 cards in carousel layout
- ✅ Pagination dots (1-6) showing active card
- ✅ Glassmorphism design: `blur(20px)`, `rgba(255, 255, 255, 0.05)`
- ✅ Card height: `50vh` (max `420px`)
- ✅ Mobile-first, touch-friendly
- ✅ Smooth 0.3s transitions
- ✅ Vertical scrolling within cards if needed
- ✅ Positive UX: "No match" not "Lost", green highlights for wins

## Design Specifications

### Glassmorphism Cards

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.18);
border-radius: 24px;
height: 50vh;
max-height: 420px;
```

### Background Gradient

```css
background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e);
```

### Accent Colors

```css
/* Primary gradient */
background: linear-gradient(135deg, #df600c, #f45da6);

/* Success/Win */
color: #22c55e;

/* Pending/Neutral */
color: #3b82f6;
```

### Swipe Implementation

```tsx
const handlers = useSwipeable({
  onSwipedLeft: () => setActiveCard(prev => Math.min(prev + 1, 5)),
  onSwipedRight: () => setActiveCard(prev => Math.max(prev - 1, 0)),
  trackMouse: true,
  trackTouch: true,
});
```

## API Usage

All endpoints accept either `walletAddress` or `telegramId` as query parameters:

```typescript
// Example: Get user stats
GET /api/user/profile/stats?walletAddress=UQD...abc

// Example: Get activity for last 30 days
GET /api/user/profile/activity?telegramId=123456789&days=30

// Example: Get recent tickets
GET /api/user/profile/recent-tickets?walletAddress=UQD...abc&limit=6
```

## Card Details

### Card 1: My Lottery Journey
- Tickets Bought count
- Wins count
- TON Won amount
- Net Result with emoji (📈 profit, 📊 neutral)
- Member since date

### Card 2: Achievements
- 4 achievements with icons (🎫🎖️🔥💎)
- Unlocked/locked states
- Progress bars for incomplete achievements
- Visual feedback (green glow for unlocked)

### Card 3: Activity (30 days)
- CSS-based bar chart (last 7 days visible)
- Summary: Total tickets, draws entered, wins
- Animated bars on card load

### Card 4: Favorite Numbers
- Top 5 most picked numbers
- Frequency bars showing relative picks
- "Quick Pick These Numbers" button
- Navigation to buy page with pre-selected numbers

### Card 5: Earnings
- Spent breakdown
- Won breakdown
- Referral earnings
- Total Result with large display
- Color-coded: green for profit, neutral otherwise

### Card 6: Recent Tickets
- 2 most recent tickets
- Number badges with match highlighting
- Status badges: Won 🎉 / Pending / No match
- Win amount display
- "View All Tickets" button

## Responsive Design

- **Mobile (320px+)**: Single card view, swipe navigation
- **Tablet (768px+)**: Larger padding, better spacing
- **Touch-friendly**: Minimum 44x44px buttons
- **Scrollable cards**: Vertical overflow for long content

## Positive UX

All messaging focuses on positive language:

- ❌ "Lost" → ✅ "No match"
- ❌ Red negative values → ✅ Neutral gray
- ❌ "Failed" → ✅ "Pending"
- ✅ Green highlights for wins
- ✅ Emojis for engagement

## File Structure

```
backend/src/
  routes/user/
    profile.ts              # All 6 API endpoints

src/
  components/profile/
    JourneyCard.tsx         # Card 1
    AchievementsCard.tsx    # Card 2
    ActivityCard.tsx        # Card 3
    FavoriteNumbersCard.tsx # Card 4
    EarningsCard.tsx        # Card 5
    RecentTicketsCard.tsx   # Card 6
  
  pages/
    ProfilePage.tsx         # Main swipeable page
    ProfilePage.css         # Glassmorphism styles
```

## Dependencies

Already installed:
- `react-swipeable@7.0.1` - Swipe gesture handling
- `framer-motion@11.0.0` - Animations
- `lucide-react@0.468.0` - Icons

## Testing

To test locally:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to `/profile`
4. Swipe left/right or click pagination dots
5. Test on mobile viewport (DevTools)

## Success Criteria

✅ 6 cards swipeable horizontally  
✅ Pagination dots work (1-6)  
✅ Each card ~50vh height  
✅ Glassmorphism applied  
✅ All APIs implemented  
✅ Mobile responsive (320px+)  
✅ Positive UX (no negative language)  
✅ Smooth transitions (0.3s)  
✅ Touch-friendly buttons (44x44px min)  
✅ Cards scrollable if content overflows  

## Notes

- Cards are lazy-loaded with loading states
- Error handling for missing user data
- Fallback to empty states when no data
- Session storage for quick pick numbers
- All times/dates formatted for locale
