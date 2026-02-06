# Authentication Testing Guide

This guide explains how to test the authentication system after the recent fixes.

## Overview of Changes

The authentication system has been updated to fix several issues:

1. **Mock authentication is now opt-in** - No longer automatically enabled in dev mode
2. **Telegram Web App integration improved** - Properly detects and authenticates Telegram users
3. **Session persistence** - User sessions are now properly restored from localStorage
4. **Better logging** - Authentication flow now has detailed console logging for debugging

## Testing Scenarios

### Scenario 1: Testing in Telegram Web App (Production Mode)

This is how real users will access the app.

**Setup:**
1. Deploy the app to a public URL (Vercel, Netlify, etc.)
2. Create a Telegram bot or use an existing one
3. Open the app through Telegram's Web App

**Expected Behavior:**
```
✅ Telegram WebApp detected - initializing
✅ Telegram user found: <username>
✅ Valid token found - restoring session (on subsequent visits)
🔄 Attempting Telegram auto-login for: <username>
✅ Auto-login successful: <username>
```

**Result:**
- User should be automatically logged in
- Profile page should show real Telegram user data
- Session should persist across page refreshes

### Scenario 2: Testing in Regular Browser (Without Telegram)

**Setup:**
1. Open the app in a regular browser (not through Telegram)
2. No environment variables set

**Expected Behavior:**
```
ℹ️ Not running in Telegram WebApp
⚠️ Cannot login - Telegram user or WebApp not available
```

**Result:**
- No automatic login
- Profile page shows "Требуется авторизация" (Authorization required)
- DevTools panel is NOT visible (because mock auth is disabled)

### Scenario 3: Testing with Mock Authentication (Dev Mode)

For local development and testing without Telegram.

**Setup:**
1. Set environment variable: `VITE_ENABLE_MOCK_AUTH=true`
2. Restart the dev server: `npm run dev`
3. Open the app in browser

**Expected Behavior:**
```
ℹ️ Not running in Telegram WebApp
(DevTools panel visible in bottom-right corner)
```

**Steps:**
1. Click the wrench icon (🔧) in the bottom-right
2. Click "Login as GorbenkoYury" or "Login as testuser"
3. Check console for:
```
🔐 loginWithTelegram called for: <username>
🔧 MOCK LOGIN: Bypassing API validation
✅ Mock login successful: <username>
```

**Result:**
- User is logged in with mock data
- Profile page shows mock user information
- Session persists across refreshes
- All features work as if user is authenticated

### Scenario 4: Session Restoration (All Modes)

**Setup:**
1. Login using any method (Telegram or mock)
2. Refresh the page

**Expected Behavior:**
```
✅ Valid token found - restoring session
✅ User session restored: <username>
```

**Result:**
- User remains logged in after refresh
- No need to re-authenticate
- Profile data loads correctly

## Environment Variables

### `VITE_ENABLE_MOCK_AUTH`

Controls whether mock authentication is available.

- `true` - Mock auth enabled, DevTools panel visible
- `false` or unset - Mock auth disabled, DevTools panel hidden

### `VITE_API_URL`

Backend API URL for authentication endpoints.

Default: `https://lottery-backend-gm4j.onrender.com`

## Debugging Authentication Issues

### Check Console Logs

The authentication system now includes detailed logging:

- ✅ = Success
- ⚠️ = Warning
- ❌ = Error
- ℹ️ = Info
- 🔄 = Processing
- 🔧 = Mock/Dev mode

### Check localStorage

Authentication data is stored in localStorage:

```javascript
// Check in browser console
localStorage.getItem('auth_token')    // JWT token
localStorage.getItem('token_expiry')  // Token expiration timestamp
localStorage.getItem('user_id')       // User ID (when using mock)
```

### Common Issues

**Issue:** "Authorization required" in production
- **Cause:** Not opened through Telegram Web App
- **Solution:** Use the Telegram bot link to open the app

**Issue:** DevTools not visible in dev mode
- **Cause:** `VITE_ENABLE_MOCK_AUTH` not set
- **Solution:** Set `VITE_ENABLE_MOCK_AUTH=true` in `.env` file

**Issue:** Session not persisting
- **Cause:** Token expired or localStorage cleared
- **Solution:** Check token expiry in console logs, re-login if expired

**Issue:** Mock login not working
- **Cause:** Mock auth not enabled
- **Solution:** Verify `VITE_ENABLE_MOCK_AUTH=true` is set and server restarted

## Testing Checklist

Before deploying:

- [ ] Test login in Telegram Web App (real environment)
- [ ] Test session persistence after refresh
- [ ] Test logout functionality
- [ ] Test in regular browser (should show auth required)
- [ ] Test mock auth with DevTools (dev only)
- [ ] Verify token expiration handling
- [ ] Check that DevTools are hidden in production
- [ ] Verify API calls include authentication token

## Architecture Notes

### Authentication Flow

1. **App Initialization**
   - `AuthContext` mounts
   - Checks for existing token in localStorage
   - If valid token exists, restores session
   - If expired, clears token

2. **Telegram Detection**
   - `useTelegram` hook checks for `window.Telegram?.WebApp`
   - If found, initializes Telegram WebApp
   - Extracts user data from `initDataUnsafe`

3. **Auto-Login**
   - Triggers when Telegram user detected
   - Sends authentication request to backend
   - Stores token and user data on success

4. **Manual Login** (via DevTools)
   - Only available when `VITE_ENABLE_MOCK_AUTH=true`
   - Bypasses API validation
   - Creates mock user and token

### Key Files

- `src/contexts/AuthContext.tsx` - Main auth logic
- `src/lib/telegram/useTelegram.ts` - Telegram integration
- `src/lib/utils/env.ts` - Environment configuration
- `src/lib/auth/token.ts` - Token management
- `src/components/DevTools/DevToolsPanel.tsx` - Dev tools UI

## API Endpoints

### POST `/api/auth/telegram`

Authenticates user with Telegram data.

**Request:**
```json
{
  "id": "123456789",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://...",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "telegramId": 123456789,
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "level": "1",
    "experience": 0
  }
}
```

### GET `/api/user/profile`

Fetches user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "telegramId": 123456789,
    "username": "johndoe",
    ...
  }
}
```
