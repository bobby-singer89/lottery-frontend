# Authentication Fix - Testing Guide

## Quick Verification Checklist

### 1. Verify Debug Component Appears
**Expected**: Red box in top-right corner (development mode only)

**How to Test**:
1. Start the development server: `npm run dev`
2. Open the app in a browser
3. Look for a red box in the top-right corner with "🔍 AUTH DEBUG"

**What to See**:
```
🔍 AUTH DEBUG
Component Loaded: YES
isAuthenticated: ✅ true / ❌ false
isLoading: ⏳ true / ✅ false
User: ✅ [username] / ❌ null
User ID: [number]
Telegram User: ✅ YES / ❌ NO
Token: ✅ EXISTS / ❌ NONE
```

### 2. Verify Console Logs
**Expected**: Multiple auth-related console logs

**How to Test**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Reload the page

**Expected Console Output**:
```
🔄 AuthProvider mounted
🔄 Initializing authentication...
🔍 AUTH STATUS CHECK:
- Component mounted: true
- isAuthenticated: true/false
- isLoading: false
- user: [User Object or null]
📡 API Request: /api/gamification/achievements { hasToken: true, headers: [...] }
📡 Gamification API Request: { endpoint: '/api/gamification/achievements', hasToken: true, userIdentifier: '12345', headers: {...} }
🔍 AUTH DEBUG Component Rendering
```

### 3. Verify Gamification API Headers
**Expected**: No 401 errors when accessing achievements/gamification features

**How to Test**:
1. Log in with Telegram
2. Navigate to Achievements page (`/achievements`)
3. Check Network tab in DevTools
4. Look for requests to `/api/gamification/achievements`

**Expected Request Headers**:
```
Authorization: Bearer [token]
x-user-id: [user_id]
Content-Type: application/json
```

**Expected Response**: 200 OK (not 401)

### 4. Test Emergency Auth Bypass (Development Only)
**Expected**: Can authenticate without Telegram

**How to Test**:
1. Open browser console
2. Set bypass flag:
   ```javascript
   localStorage.setItem('dev_auth_bypass', 'true');
   location.reload();
   ```
3. Check debug component shows:
   - User: ✅ Dev
   - User ID: 999999

**To Disable**:
```javascript
localStorage.removeItem('dev_auth_bypass');
location.reload();
```

### 5. Test User ID Storage
**Expected**: User ID stored in localStorage after login

**How to Test**:
1. Log in with Telegram
2. Open browser console
3. Check localStorage:
   ```javascript
   localStorage.getItem('user_id')
   localStorage.getItem('telegram_id')
   localStorage.getItem('auth_user')
   ```

**Expected**:
- `user_id`: Should be a number string
- `telegram_id`: Should match Telegram ID
- `auth_user`: Should be a JSON string with user data

## Common Issues and Solutions

### Issue 1: Debug Component Not Appearing
**Symptoms**: No red box in top-right corner

**Solutions**:
1. Ensure you're in development mode (`npm run dev`, not production build)
2. Check AuthProvider is rendering in App.tsx
3. Check console for errors
4. Verify `import.meta.env.PROD` is false

### Issue 2: 401 Errors Still Occurring
**Symptoms**: API returns "No user identification provided"

**Solutions**:
1. Check user is logged in (debug component shows user)
2. Verify `user_id` exists in localStorage
3. Check Network tab - request should have `x-user-id` header
4. Ensure endpoint includes `/gamification` in path
5. Clear localStorage and log in again

### Issue 3: No Console Logs
**Symptoms**: Console is empty, no auth logs

**Solutions**:
1. Ensure you're in development mode
2. Check console filter settings (should show all logs)
3. Verify code changes were applied (rebuild if necessary)
4. Hard refresh the page (Ctrl+Shift+R)

### Issue 4: Emergency Bypass Not Working
**Symptoms**: Dev user not created

**Solutions**:
1. Ensure `localStorage.setItem('dev_auth_bypass', 'true')` was run
2. Verify you're in development mode
3. Check you're not already logged in (log out first)
4. Reload page after setting flag
5. Check console for "🔓 DEV MODE: Auth bypass enabled"

## Production Verification

### What Should NOT Appear in Production:
1. ❌ Debug component (red box)
2. ❌ Console logs starting with 🔄, 🔍, 📡
3. ❌ Emergency auth bypass
4. ❌ Development-only features

### What SHOULD Work in Production:
1. ✅ Telegram authentication
2. ✅ x-user-id headers on gamification requests
3. ✅ User data stored in localStorage
4. ✅ Achievements API working without 401 errors
5. ✅ Token management
6. ✅ Session restoration on reload

## API Testing

### Manual API Test
```bash
# Get user token from localStorage
TOKEN="your_token_here"
USER_ID="your_user_id_here"

# Test achievements endpoint
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  https://lottery-backend-gm4j.onrender.com/api/gamification/achievements
```

**Expected**: 200 OK with achievements data

### Using DevTools Network Tab
1. Open Network tab
2. Filter by "gamification"
3. Check request headers include:
   - Authorization
   - x-user-id
4. Check response is 200 OK

## Success Criteria

All of the following should be true:

- [x] Debug component visible in development
- [x] Console logs show authentication flow
- [x] No 401 errors on gamification endpoints
- [x] User ID stored in localStorage after login
- [x] x-user-id header present in gamification API requests
- [x] Emergency bypass works in development
- [x] Build succeeds without errors
- [x] No TypeScript errors
- [x] No security vulnerabilities (CodeQL passed)
- [x] Production build excludes debug features

## Next Steps

If all tests pass:
1. ✅ Merge PR
2. ✅ Deploy to production
3. ✅ Verify in production environment
4. ✅ Monitor for 401 errors

If tests fail:
1. Check specific issue section above
2. Review implementation docs
3. Check browser console for errors
4. Contact development team
