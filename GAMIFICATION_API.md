# Gamification API Documentation

## Overview

The Gamification API provides a complete backend for managing referrals, quests, achievements, streaks, and rewards in the lottery application. All endpoints are prefixed with `/api/gamification`.

## Authentication

All gamification endpoints require a user identifier to be passed via the `x-user-id` header or `userId` query parameter/body field.

```
GET /api/gamification/profile
Headers:
  x-user-id: user123
```

## Rate Limiting

- **Global limit**: 100 requests per minute per user
- **Route-specific limit**: 50 requests per minute per user

## Endpoints

### Profile & Leaderboard

#### GET /profile
Get complete gamification profile for a user.

**Response:**
```json
{
  "success": true,
  "profile": {
    "profile": {
      "userId": "user123",
      "level": 5,
      "xp": 1250,
      "totalTickets": 45,
      "totalWinnings": "125.50",
      "nextLevelXp": 1500
    },
    "referral": {
      "code": "ABC123",
      "totalReferrals": 5,
      "activeReferrals": 4,
      "totalRewards": 3,
      "claimedRewards": 2
    },
    "streak": {
      "currentStreak": 7,
      "longestStreak": 15,
      "lastCheckIn": "2026-01-31T10:00:00Z",
      "totalCheckIns": 42,
      "streakBonus": 350,
      "canCheckIn": false
    },
    "quests": {
      "active": 3,
      "completed": 2,
      "recent": [...]
    },
    "achievements": {
      "total": 12,
      "recent": [...]
    },
    "rewards": {
      "available": 4,
      "totalValue": 250
    }
  }
}
```

#### GET /leaderboard
Get leaderboard rankings.

**Query Parameters:**
- `type`: Ranking type (`level`, `xp`, `tickets`, `winnings`) - default: `level`
- `limit`: Number of results (1-100) - default: 10

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user456",
      "level": 25,
      "xp": 15000,
      "totalTickets": 500,
      "totalWinnings": "5000.00"
    }
  ]
}
```

### Referral System

#### GET /referral/code
Get or generate a referral code for the user.

**Response:**
```json
{
  "success": true,
  "code": "ABC123"
}
```

#### POST /referral/apply
Apply a referral code.

**Body:**
```json
{
  "code": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral code applied successfully"
}
```

**Errors:**
- Invalid or inactive referral code
- Referral code has expired
- Cannot use your own referral code
- Referral relationship already exists

#### GET /referral/stats
Get referral statistics for the user.

**Response:**
```json
{
  "success": true,
  "stats": {
    "code": "ABC123",
    "totalReferrals": 5,
    "activeReferrals": 4,
    "totalRewards": 3,
    "claimedRewards": 2
  }
}
```

#### GET /referral/tree
Get referral tree (hierarchy of referred users).

**Query Parameters:**
- `maxDepth`: Maximum tree depth (1-3) - default: 3

**Response:**
```json
{
  "success": true,
  "tree": {
    "userId": "user123",
    "level": 5,
    "totalReferrals": 5,
    "children": [
      {
        "userId": "user456",
        "level": 3,
        "status": "active",
        "children": [...]
      }
    ]
  }
}
```

### Quest System

#### GET /quests/available
Get available quests.

**Query Parameters:**
- `type`: Quest type filter (`daily`, `weekly`, `monthly`, `special`)

**Response:**
```json
{
  "success": true,
  "quests": [
    {
      "id": "quest-uuid",
      "title": "Первый билет дня",
      "description": "Купите ваш первый билет сегодня",
      "type": "daily",
      "category": "tickets",
      "target": 1,
      "progress": 0,
      "isCompleted": false,
      "reward": { "type": "xp", "value": 50 },
      "rewardClaimed": false
    }
  ]
}
```

#### GET /quests/mine
Get user's active and completed quests.

**Response:**
```json
{
  "success": true,
  "quests": [
    {
      "id": "user-quest-uuid",
      "questId": "quest-uuid",
      "title": "Активный игрок",
      "description": "Купите 3 билета сегодня",
      "type": "daily",
      "category": "tickets",
      "target": 3,
      "progress": 2,
      "isCompleted": false,
      "reward": { "type": "xp", "value": 150 },
      "rewardClaimed": false
    }
  ]
}
```

#### POST /quests/:id/claim
Claim a quest reward.

**Response:**
```json
{
  "success": true,
  "message": "Quest reward claimed successfully"
}
```

**Errors:**
- Quest not found
- Quest not completed
- Reward already claimed

### Achievement System

#### GET /achievements/all
Get all available achievements.

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "id": "achievement-uuid",
      "name": "first_ticket",
      "title": "Первый шаг",
      "description": "Купил первый лотерейный билет",
      "category": "tickets",
      "tier": "bronze",
      "requirement": { "type": "tickets_purchased", "value": 1 },
      "reward": { "type": "xp", "value": 100 },
      "icon": "🎫"
    }
  ]
}
```

#### GET /achievements/mine
Get user's unlocked achievements.

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "id": "user-achievement-uuid",
      "achievementId": "achievement-uuid",
      "name": "first_ticket",
      "title": "Первый шаг",
      "description": "Купил первый лотерейный билет",
      "category": "tickets",
      "tier": "bronze",
      "icon": "🎫",
      "reward": { "type": "xp", "value": 100 },
      "unlockedAt": "2026-01-25T10:00:00Z",
      "rewardClaimed": true
    }
  ]
}
```

#### POST /achievements/:id/claim
Claim an achievement reward.

**Response:**
```json
{
  "success": true,
  "message": "Achievement reward claimed successfully"
}
```

#### POST /achievements/check
Manually trigger achievement evaluation for the user.

**Response:**
```json
{
  "success": true,
  "newlyUnlocked": [
    {
      "id": "achievement-uuid",
      "name": "ticket_buyer_10",
      "title": "Коллекционер",
      "unlockedAt": "2026-01-31T12:00:00Z"
    }
  ]
}
```

### Streak System

#### GET /streak/current
Get user's current streak information.

**Response:**
```json
{
  "success": true,
  "streak": {
    "currentStreak": 7,
    "longestStreak": 15,
    "lastCheckIn": "2026-01-30T10:00:00Z",
    "totalCheckIns": 42,
    "streakBonus": 350,
    "canCheckIn": true
  }
}
```

#### POST /streak/checkin
Perform daily check-in.

**Response:**
```json
{
  "success": true,
  "result": {
    "currentStreak": 8,
    "longestStreak": 15,
    "bonusEarned": 75,
    "totalCheckIns": 43
  }
}
```

**Errors:**
- Already checked in today

### Reward System

#### GET /rewards/available
Get available (unclaimed) rewards.

**Response:**
```json
{
  "success": true,
  "rewards": [
    {
      "id": "reward-uuid",
      "rewardId": "master-reward-uuid",
      "type": "quest_completion",
      "name": "Quest Reward",
      "description": "Reward for completing a quest",
      "value": 50,
      "currency": null,
      "claimed": false,
      "expiresAt": "2026-02-15T00:00:00Z"
    }
  ]
}
```

#### GET /rewards/claimed
Get claimed rewards history.

**Query Parameters:**
- `limit`: Number of results (1-100) - default: 20

**Response:**
```json
{
  "success": true,
  "rewards": [
    {
      "id": "reward-uuid",
      "type": "daily_bonus",
      "name": "Daily Check-in Bonus",
      "value": 10,
      "claimedAt": "2026-01-31T10:00:00Z"
    }
  ]
}
```

#### POST /rewards/:id/claim
Claim a reward.

**Response:**
```json
{
  "success": true,
  "reward": {
    "type": "quest_completion",
    "name": "Quest Reward",
    "value": 50,
    "currency": null
  }
}
```

**Errors:**
- Reward not found
- Reward already claimed
- Reward has expired

## Event Hooks

The gamification system automatically tracks certain events:

### Ticket Purchase
When a user purchases tickets, the system:
- Updates user's `totalTickets` count
- Grants XP (10 XP per ticket)
- Checks for level up
- Updates quest progress for 'tickets' category
- Evaluates achievements

### Win Event
When a user wins:
- Updates user's `totalWinnings`
- Grants bonus XP (50 XP per win)
- Evaluates achievements

## Background Jobs

The system runs several scheduled jobs:

- **Daily Quest Reset**: Midnight (00:00) - Resets all daily quests
- **Weekly Quest Reset**: Monday midnight - Resets all weekly quests
- **Monthly Quest Reset**: 1st of month midnight - Resets all monthly quests
- **Streak Checker**: Daily at 1 AM - Checks for broken streaks
- **Reward Cleanup**: Daily at 2 AM - Removes expired rewards

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400`: Bad request (validation error, business logic error)
- `401`: Unauthorized (missing user ID)
- `429`: Too many requests (rate limit exceeded)
- `500`: Internal server error
