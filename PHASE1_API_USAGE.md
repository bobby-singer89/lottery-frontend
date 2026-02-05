# Phase 1: API Client & Base Setup - Usage Guide

This document provides examples of how to use the new API infrastructure added in Phase 1.

## Overview

Phase 1 introduces:
- Centralized API endpoints
- Type-safe API responses
- Comprehensive error handling
- Custom React hooks for API calls
- Loading and error UI components

## Using API Endpoints

### Import Endpoints

```typescript
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// Example: Get lottery list
const url = API_ENDPOINTS.LOTTERY.LIST; // '/lottery/list'

// Example: Get specific lottery
const lotteryUrl = API_ENDPOINTS.LOTTERY.DETAILS('weekend-special'); 
// '/lottery/weekend-special'

// Example: Build query string
import { buildQueryString } from '@/lib/api/endpoints';
const params = buildQueryString({ page: 1, limit: 20 });
// '?page=1&limit=20'
```

## Using the API Client

### Basic Usage

```typescript
import { apiClient } from '@/lib/api/client';

// Set authentication token
apiClient.setAuthToken('your-jwt-token');

// Get token
const token = apiClient.getAuthToken();

// Clear token
apiClient.clearAuthToken();

// Make API calls
const response = await apiClient.getLotteryList();
```

## Using Custom Hooks

### useLotteryBackend Hook

```typescript
import { useLotteryBackend } from '@/hooks/useLotteryBackend';
import { apiClient } from '@/lib/api/client';

function LotteryList() {
  const { result, working, problem, callBackend } = useLotteryBackend();

  useEffect(() => {
    callBackend(apiClient.getLotteryList());
  }, []);

  if (working) return <div>Loading...</div>;
  if (problem) return <div>Error: {problem.message}</div>;
  if (!result) return null;

  return (
    <div>
      {result.lotteries.map(lottery => (
        <div key={lottery.id}>{lottery.name}</div>
      ))}
    </div>
  );
}
```

## Using Loading Components

### TicketLoader

```typescript
import { TicketLoader } from '@/components/LotteryLoaders';

function PurchaseButton() {
  const [purchasing, setPurchasing] = useState(false);

  if (purchasing) {
    return <TicketLoader text="Buying ticket..." />;
  }

  return <button onClick={handlePurchase}>Buy Ticket</button>;
}
```

### DrawLoader

```typescript
import { DrawLoader } from '@/components/LotteryLoaders';

function DrawResults() {
  const { working } = useLotteryBackend();

  if (working) {
    return <DrawLoader overlayScreen={true} />;
  }

  return <div>Results...</div>;
}
```

## Error Handling

### Using Error Classes

```typescript
import { parseApiError, getUserFriendlyMessage } from '@/lib/api/errors';

try {
  const response = await apiClient.buyTicket('weekend-special', numbers, txHash);
} catch (err) {
  const error = parseApiError(err);
  const message = getUserFriendlyMessage(error);
  console.error(message);
}
```

### Error Types

The following error types are available:
- `NetworkError` - Connection issues
- `AuthenticationError` - 401 errors
- `AuthorizationError` - 403 errors
- `NotFoundError` - 404 errors
- `ValidationError` - 400/422 errors
- `ServerError` - 500+ errors
- `TimeoutError` - Request timeouts

## Type Safety

### Using API Types

```typescript
import type { Lottery, Ticket, User } from '@/types/api';

function processLottery(lottery: Lottery) {
  console.log(lottery.name, lottery.ticketPrice);
}

function processTicket(ticket: Ticket) {
  console.log(ticket.numbers, ticket.status);
}
```

## Error Boundary

The app is wrapped with `LotteryErrorCatcher` in `main.tsx`. It automatically catches and handles runtime errors with a user-friendly UI and recovery options.

## Environment Variables

### Available Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# Development
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_MOCK_AUTH=false
```

### Accessing in Code

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const timeout = import.meta.env.VITE_API_TIMEOUT;
const devTools = import.meta.env.VITE_ENABLE_DEV_TOOLS;
```

## QueryClient Configuration

TanStack Query is configured with:
- 2 retries on failure
- 5-minute stale time
- No refetch on window focus

Located in: `src/main.tsx`

## Next Steps for Phase 2

- Implement full authentication flow
- Add token refresh mechanism
- Integrate with actual backend endpoints
- Replace mock data with real API calls
