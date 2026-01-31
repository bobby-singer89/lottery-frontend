# Gamification System Setup Guide

## Overview

This guide will help you set up and integrate the complete gamification system into the lottery application. The system includes:

- **Referral System**: User invitations with referral codes
- **Quest System**: Daily, weekly, and monthly challenges
- **Achievement System**: Milestone-based achievements
- **Streak System**: Daily login rewards
- **Reward System**: Unified reward distribution

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase or standalone)
- Existing lottery backend running

## Backend Setup

### 1. Install Dependencies

The gamification backend uses Prisma ORM for database management.

```bash
cd backend
npm install
```

Prisma 5.x is already installed via the package.json.

### 2. Configure Database

Add the `DATABASE_URL` to your `.env` file:

```bash
# .env
DATABASE_URL=postgresql://user:password@host:port/database

# For Supabase, use the connection string from your Supabase project:
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Run Database Migrations

Apply the gamification schema to your database:

```bash
# Using Supabase SQL Editor or psql
psql $DATABASE_URL < migrations/010_gamification_system.sql
```

Or run via Supabase dashboard:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy contents of `migrations/010_gamification_system.sql`
4. Execute the SQL

### 4. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

This generates the TypeScript types and client for the gamification models.

### 5. Seed Initial Data

Seed the database with initial quests and achievements:

```bash
# Using SQL
psql $DATABASE_URL < prisma/seed.sql  # (Note: This file contains SQL, not TypeScript)

# Or via Supabase SQL Editor
# Copy and execute the contents of prisma/seed.sql
```

### 6. Build and Start Backend

```bash
cd backend
npm run build
npm start
```

The backend will now include gamification endpoints at `/api/gamification/*`.

### 7. Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3001/health
```

Test a gamification endpoint:

```bash
curl -H "x-user-id: test-user" http://localhost:3001/api/gamification/profile
```

## Frontend Integration

### 1. Import Hooks

The gamification hooks are already available in your frontend:

```typescript
import { 
  useGamification,
  useReferral,
  useQuests,
  useAchievements,
  useStreak,
  useRewards
} from '@/hooks';
```

### 2. Basic Usage Example

```typescript
import { useGamification, useStreak } from '@/hooks';

function GamificationDashboard() {
  const userId = 'user123'; // Get from your auth context
  const { profile, isLoading } = useGamification(userId);
  const { currentStreak, checkIn, canCheckIn } = useStreak(userId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Level {profile?.profile?.level}</h2>
      <p>XP: {profile?.profile?.xp} / {profile?.profile?.nextLevelXp}</p>
      
      <div>
        <p>Current Streak: {currentStreak} days</p>
        {canCheckIn && (
          <button onClick={() => checkIn()}>
            Check In Today
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3. Connect to Existing Components

Your existing gamification UI components can now use these hooks:

#### PlayerLevel Component
```typescript
import { useGamification } from '@/hooks';

function PlayerLevel() {
  const userId = getCurrentUserId(); // Your auth function
  const { userLevel, userXp, nextLevelXp } = useGamification(userId);
  
  return (
    <PlayerLevelComponent 
      levelData={{
        current: getLevelTier(userLevel),
        xp: userXp,
        xpToNext: nextLevelXp,
        benefits: getLevelBenefits(userLevel)
      }}
    />
  );
}
```

#### StreakCounter Component
```typescript
import { useStreak } from '@/hooks';

function StreakCounter() {
  const userId = getCurrentUserId();
  const { currentStreak, longestStreak, checkIn, canCheckIn } = useStreak(userId);
  
  return (
    <StreakCounterComponent
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      onCheckIn={canCheckIn ? checkIn : undefined}
    />
  );
}
```

#### DailyQuests Component
```typescript
import { useQuests } from '@/hooks';

function DailyQuests() {
  const userId = getCurrentUserId();
  const { dailyQuests, claimReward } = useQuests(userId);
  
  return (
    <DailyQuestsComponent
      quests={dailyQuests}
      onClaimReward={claimReward}
    />
  );
}
```

#### AchievementBadges Component
```typescript
import { useAchievements } from '@/hooks';

function AchievementBadges() {
  const userId = getCurrentUserId();
  const { userAchievements, unclaimedRewards } = useAchievements(userId);
  
  return (
    <AchievementBadgesComponent
      achievements={userAchievements}
      unclaimedCount={unclaimedRewards}
    />
  );
}
```

#### ReferralQR Component
```typescript
import { useReferral } from '@/hooks';

function ReferralQR() {
  const userId = getCurrentUserId();
  const { referralCode, getReferralLink } = useReferral(userId);
  
  return (
    <ReferralQRComponent
      userId={userId}
      referralLink={getReferralLink()}
    />
  );
}
```

## Integration with Ticket Purchase

To track ticket purchases for gamification, integrate the `gamificationService`:

```typescript
// In your ticket purchase handler
import { gamificationService } from './backend/src/services/gamificationService';

async function handleTicketPurchase(userId: string, ticketCount: number, amount: number) {
  // ... existing ticket purchase logic ...
  
  // Track for gamification
  const gamificationResult = await gamificationService.onTicketPurchase(
    userId,
    ticketCount,
    amount
  );
  
  if (gamificationResult.leveledUp) {
    // Show level up notification
    showNotification(`Congratulations! You reached level ${gamificationResult.newLevel}!`);
  }
}
```

## Database Schema

The gamification system adds these tables to your database:

- **UserProfile**: Extended user profiles (level, XP, stats)
- **ReferralCode**: User referral codes
- **ReferralRelationship**: Referrer-referred relationships
- **ReferralReward**: Referral rewards
- **Quest**: Available quests (daily, weekly, monthly)
- **UserQuest**: User quest progress
- **Achievement**: Available achievements
- **UserAchievement**: Unlocked achievements
- **UserStreak**: Daily login streaks
- **Reward**: Available rewards
- **UserReward**: User rewards

See `backend/prisma/schema.prisma` for the complete schema.

## Configuration

### Customizing Quests

Edit `backend/prisma/seed.sql` to add custom quests:

```typescript
INSERT INTO public."Quest" ("title", "description", "type", "category", "target", "reward", "difficulty")
VALUES
  ('Custom Quest', 'Do something amazing', 'daily', 'custom', 5, '{"type": "xp", "value": 100}', 'medium');
```

### Customizing Achievements

Add new achievements in the seed file:

```typescript
INSERT INTO public."Achievement" ("name", "title", "description", "category", "tier", "requirement", "reward")
VALUES
  ('custom_achievement', 'Custom Title', 'Custom description', 'custom', 'gold', 
   '{"type": "custom_metric", "value": 100}', '{"type": "xp", "value": 500}');
```

### Adjusting Streak Bonuses

Modify the `calculateStreakBonus` function in `backend/src/services/streakService.ts`:

```typescript
private calculateStreakBonus(streakDays: number): number {
  // Customize your streak bonus formula
  if (streakDays <= 7) {
    return 10 + (streakDays - 1) * 5;
  }
  // ...
}
```

### XP and Level System

Adjust the level progression formula in `backend/src/services/gamificationService.ts`:

```typescript
private calculateNextLevelXp(level: number): number {
  // Customize your level progression
  return Math.floor(100 * Math.pow(level, 1.5));
}
```

## Monitoring

### Check Background Jobs

The gamification system runs several cron jobs. Check logs for:

```
✅ Gamification jobs scheduled:
   - Daily quest reset: midnight (00:00)
   - Weekly quest reset: Monday midnight
   - Monthly quest reset: 1st of month midnight
   - Streak checker: daily at 1 AM
   - Reward cleanup: daily at 2 AM
```

### Database Queries

Monitor gamification usage:

```sql
-- Active users with profiles
SELECT COUNT(*) FROM "UserProfile";

-- Total referrals
SELECT COUNT(*) FROM "ReferralRelationship" WHERE status = 'active';

-- Quest completion rate
SELECT 
  q."type",
  COUNT(DISTINCT uq."userId") as active_users,
  SUM(CASE WHEN uq."isCompleted" THEN 1 ELSE 0 END) as completed
FROM "UserQuest" uq
JOIN "Quest" q ON q."id" = uq."questId"
GROUP BY q."type";

-- Top players by level
SELECT "userId", "level", "xp" 
FROM "UserProfile" 
ORDER BY "level" DESC, "xp" DESC 
LIMIT 10;
```

## Troubleshooting

### "User ID is required" error
Ensure you're passing the userId in the `x-user-id` header or request body.

### Prisma client errors
Regenerate the Prisma client:
```bash
cd backend
npx prisma generate
```

### Migration errors
Ensure your database user has CREATE TABLE permissions.

### Cron jobs not running
Check that the backend process is running continuously (not just for API requests).

## API Documentation

See [GAMIFICATION_API.md](./GAMIFICATION_API.md) for complete API documentation.

## Security Considerations

1. **User ID validation**: Always validate that the userId in requests matches the authenticated user
2. **Rate limiting**: Built-in rate limiting prevents abuse (100 req/min globally, 50 req/min per route)
3. **Input validation**: All inputs are validated before database operations
4. **Prevent self-referral**: Users cannot use their own referral codes

## Performance Tips

1. **Caching**: Consider adding Redis caching for leaderboards and frequently accessed data
2. **Indexing**: Database indexes are already configured for optimal performance
3. **Batch operations**: Use batch APIs when possible
4. **Lazy loading**: Load gamification data only when needed in the UI

## Next Steps

1. Customize quests and achievements for your lottery
2. Integrate with your authentication system
3. Add UI components for gamification features
4. Monitor user engagement metrics
5. A/B test different reward structures

## Support

For issues or questions:
1. Check the [API Documentation](./GAMIFICATION_API.md)
2. Review the Prisma schema in `backend/prisma/schema.prisma`
3. Check service implementations in `backend/src/services/`
4. Review route handlers in `backend/src/routes/gamification/`
