-- Add test lotteries for TON currency
INSERT INTO "Lottery" (
  name, 
  slug, 
  currency, 
  jackpot, 
  "ticketPrice", 
  "maxTickets",
  "drawDate",
  description,
  featured, 
  active,
  "createdAt",
  "updatedAt"
) VALUES 
  (
    'Mega Jackpot', 
    'mega-jackpot', 
    'TON', 
    10000, 
    10,
    1234,
    NOW() + INTERVAL '2 days',
    'Largest TON jackpot - win up to 10,000 TON!',
    true, 
    true,
    NOW(),
    NOW()
  ),
  (
    'Weekend Special', 
    'weekend-special', 
    'TON', 
    5075, 
    5,
    856,
    NOW() + INTERVAL '1 day',
    'Weekend lottery with guaranteed prizes',
    true, 
    true,
    NOW(),
    NOW()
  ),
  (
    'Daily Draw', 
    'daily-draw', 
    'TON', 
    2000, 
    2,
    432,
    NOW() + INTERVAL '12 hours',
    'Quick daily lottery with instant results',
    false, 
    true,
    NOW(),
    NOW()
  );

-- Add test lotteries for USDT currency
INSERT INTO "Lottery" (
  name, 
  slug, 
  currency, 
  jackpot, 
  "ticketPrice",
  "maxTickets",
  "drawDate",
  description,
  featured, 
  active,
  "createdAt",
  "updatedAt"
) VALUES 
  (
    'USDT Mega Pool', 
    'usdt-mega-pool', 
    'USDT', 
    52000, 
    52,
    800,
    NOW() + INTERVAL '3 days',
    'Massive USDT prize pool - stable and secure!',
    true, 
    true,
    NOW(),
    NOW()
  ),
  (
    'USDT Weekend', 
    'usdt-weekend', 
    'USDT', 
    26390, 
    26,
    650,
    NOW() + INTERVAL '2 days',
    'Weekend USDT lottery with guaranteed payouts',
    true, 
    true,
    NOW(),
    NOW()
  ),
  (
    'USDT Quick Draw', 
    'usdt-quick-draw', 
    'USDT', 
    10400, 
    10,
    520,
    NOW() + INTERVAL '18 hours',
    'Fast USDT lottery with instant results',
    false, 
    true,
    NOW(),
    NOW()
  );

-- Verify data
SELECT 
  id,
  name,
  currency,
  jackpot,
  "ticketPrice",
  featured,
  active
FROM "Lottery"
ORDER BY currency, featured DESC, jackpot DESC;
