# Gamification System Integration

## Overview

This document describes the gamification system integration in the lottery-frontend application. The gamification system includes daily check-ins, streaks, quests, achievements, and player progression.

## Backend API

The backend gamification API is deployed at:
```
https://lottery-backend-gm4j.onrender.com/api/gamification/
```

## Architecture

### File Structure

```
src/
├── types/
│   └── gamification.ts          # TypeScript types for all gamification entities
├── services/
│   └── gamificationApi.ts       # API client with all gamification endpoints
├── hooks/
│   ├── useGamification.ts       # Hook for profile, level, XP data
│   ├── useStreak.ts             # Hook for streak data + check-in mutation
│   ├── useQuests.ts             # Hook for quests with filtering
│   ├── useAchievements.ts       # Hook for achievements with progress
│   └── useReferral.ts           # Hook for referral stats and code
└── components/
    └── Gamification/
        ├── CheckInButton.tsx    # Daily check-in button with animations
        ├── CheckInButton.css
        ├── PlayerLevel.tsx      # Player level and XP progress bar
        ├── PlayerLevel.css
        ├── StreakCounter.tsx    # Streak visualization and rewards
        ├── StreakCounter.css
        ├── DailyQuests.tsx      # Daily quests list with claim functionality
        ├── DailyQuests.css
        ├── AchievementBadges.tsx # Achievements grid with modal
        └── AchievementBadges.css
```

### Integration Points

#### 1. ProfilePage (`src/pages/ProfilePage.tsx`)

The ProfilePage has been enhanced with gamification sections:

- **CheckInButton** - Displayed at the top for daily check-ins
- **PlayerLevel** - Shows current level, XP, and progress bar
- **StreakCounter** - Displays current and longest streaks with milestone rewards
- **DailyQuests** - Lists daily quests with progress and claim buttons
- **AchievementBadges** - Grid of achievements with unlock status

```tsx
// Example usage
const userId = user?.id?.toString();
const gamification = useGamification(userId);
const streak = useStreak(userId);
const quests = useQuests(userId);
const achievements = useAchievements(userId);
```

#### 2. HomePage (`src/pages/HomePage.tsx`)

The HomePage displays a check-in banner for logged-in users:

- **CheckInButton Banner** - Shown after hero section, before lotteries
- Visible only when user is authenticated
- Uses the same CheckInButton component

### API Integration

All hooks use React Query for data fetching and caching. The API client automatically handles:

- **Authentication**: Reads `auth_token` from localStorage
- **User Identification**: Reads `user_id` from localStorage and sends as `x-user-id` header
- **Error Handling**: Provides error states through hooks
- **Auto-refresh**: React Query handles cache invalidation

### API Endpoints

```
GET  /api/gamification/profile              # User profile with level, XP, stats
GET  /api/gamification/streak               # Streak information
POST /api/gamification/checkin              # Daily check-in
GET  /api/gamification/quests               # All available quests
GET  /api/gamification/quests/mine          # User's quests with progress
POST /api/gamification/quests/:id/claim     # Claim quest reward
GET  /api/gamification/achievements         # All achievements
GET  /api/gamification/achievements/mine    # User's unlocked achievements
GET  /api/gamification/achievements/progress # Achievement progress
POST /api/gamification/achievements/:id/claim # Claim achievement reward
GET  /api/gamification/rewards              # User's rewards
POST /api/gamification/rewards/:id/claim    # Claim reward
GET  /api/gamification/referral/stats       # Referral statistics
POST /api/gamification/referral/apply       # Apply referral code
GET  /api/gamification/leaderboard          # Leaderboard data
```

## Features

### 1. Daily Check-In System

Users can check in daily to earn XP and maintain their streak:

- **Check-In Button**: Shows "Ежедневный вход +20 XP" when available
- **Already Checked**: Shows "✅ Вы уже отметились" when done today
- **Confetti Animation**: Celebrates successful check-ins
- **Milestone Rewards**: Extra rewards at 7, 14, 30 day streaks
- **XP Animation**: Shows earned XP with smooth animations

### 2. Player Progression

Players earn XP and level up through various activities:

- **Level Display**: Shows current level with tier badge
- **Progress Bar**: Visual representation of XP to next level
- **Tier System**: Bronze, Silver, Gold, Diamond, Platinum
- **XP Sources**: Check-ins, quests, achievements, referrals

### 3. Streak System

Encourages daily engagement with streak tracking:

- **Current Streak**: Days in a row the user has checked in
- **Longest Streak**: Best streak ever achieved
- **Visual Timeline**: Shows last 7 days with fire emoji
- **Milestone Rewards**: Unlocked at 7, 14, 30 day milestones
- **Warning**: Reminds users not to break their streak

### 4. Quest System

Daily, weekly, and monthly challenges:

- **Quest Types**: Daily, weekly, monthly, one-time
- **Categories**: Tickets, streak, social, onboarding
- **Progress Tracking**: Visual progress bars
- **Claim Rewards**: Button to claim completed quests
- **Reset Timer**: Shows time until daily quests reset

### 5. Achievement System

Long-term goals and milestones:

- **Categories**: Tickets, wins, streak, referrals, level
- **Tiers**: Bronze 🥉, Gold 🥇, Diamond 💎
- **Progress Display**: Shows current/required values
- **Modal Details**: Click badge to see full description
- **Unlock Animations**: Confetti and shine effects
- **Claim System**: Claim rewards for unlocked achievements

## Hooks Usage

### useGamification

```tsx
const { 
  profile,          // Full profile object
  level,            // Current level
  xp,               // Current XP
  xpToNextLevel,    // XP needed for next level
  totalXp,          // Total XP earned
  progress,         // Percentage progress (0-100)
  vipStatus,        // VIP tier
  totalTickets,     // Total tickets purchased
  totalWins,        // Total wins
  totalWinnings,    // Total winnings
  isLoading,        // Loading state
  error,            // Error state
} = useGamification(userId);
```

### useStreak

```tsx
const {
  streak,           // Full streak object
  currentStreak,    // Current streak days
  longestStreak,    // Longest streak days
  totalCheckIns,    // Total check-ins
  lastCheckIn,      // Last check-in timestamp
  nextMilestone,    // Next milestone info
  canCheckIn,       // Can check in today?
  isLoading,        // Loading state
  checkIn,          // Check-in function
  isCheckingIn,     // Check-in in progress?
  checkInResult,    // Result of last check-in
  clearCheckInResult, // Clear result
} = useStreak(userId);
```

### useQuests

```tsx
const {
  allQuests,        // All available quests
  myQuests,         // User's quests
  dailyQuests,      // Daily quests
  weeklyQuests,     // Weekly quests
  monthlyQuests,    // Monthly quests
  onetimeQuests,    // One-time quests
  claimableQuests,  // Completed but not claimed
  isLoading,        // Loading state
  claimQuest,       // Claim quest function
  isClaiming,       // Claiming in progress?
} = useQuests(userId);
```

### useAchievements

```tsx
const {
  allAchievements,      // All achievements
  myAchievements,       // Unlocked achievements
  progress,             // Progress for all achievements
  ticketsAchievements,  // By category
  winsAchievements,
  streakAchievements,
  referralsAchievements,
  levelAchievements,
  isLoading,            // Loading state
  claimAchievement,     // Claim function
  isClaiming,           // Claiming in progress?
} = useAchievements(userId);
```

## Styling

All gamification components follow the dark theme design:

- **Colors**: Gradient backgrounds with primary colors
- **Animations**: Smooth transitions using Framer Motion
- **Responsive**: Mobile-first design
- **Confetti**: Canvas-confetti for celebrations
- **Icons**: Lucide React for consistent iconography

## Testing

### Mock Authentication

The app supports mock authentication for testing:

```typescript
// Set in localStorage via DevTools
localStorage.setItem('user_id', '12345');
localStorage.setItem('auth_token', 'mock_token_...');
```

Mock auth is enabled in development mode or when `VITE_ENABLE_MOCK_AUTH=true`.

### Manual Testing

1. **Check-In**: Click the check-in button on HomePage or ProfilePage
2. **Quests**: View progress and claim completed quests on ProfilePage
3. **Achievements**: Click achievement badges to see details and claim rewards
4. **Streak**: Verify streak counter updates after check-in

## Build & Deployment

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Security

- ✅ CodeQL security scan passed
- ✅ No vulnerabilities in gamification code
- ✅ Proper authentication headers
- ✅ User ID validation on backend

## Future Enhancements

Potential improvements:

1. **Notifications**: Push notifications for streaks about to expire
2. **Leaderboard Page**: Dedicated leaderboard view
3. **Rewards Store**: Use earned rewards for benefits
4. **Social Features**: Share achievements on social media
5. **Animations**: More celebration animations for milestones
6. **Quest Types**: More varied quest objectives
7. **Achievement Categories**: Expand achievement system

## Support

For issues or questions:
- Check backend API status at the deployment URL
- Verify localStorage has correct `user_id` and `auth_token`
- Check browser console for API errors
- Ensure React Query DevTools for debugging cache
