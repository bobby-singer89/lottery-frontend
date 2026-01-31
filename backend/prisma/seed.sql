-- =====================================================
-- Gamification System - Seed Data
-- =====================================================
-- This file seeds the database with initial quests and achievements
-- =====================================================

-- =====================================================
-- SEED QUESTS
-- =====================================================

-- Daily Quests
INSERT INTO public."Quest" ("title", "description", "type", "category", "target", "reward", "difficulty", "isActive")
VALUES
  ('Первый билет дня', 'Купите ваш первый билет сегодня', 'daily', 'tickets', 1, '{"type": "xp", "value": 50}', 'easy', true),
  ('Активный игрок', 'Купите 3 билета сегодня', 'daily', 'tickets', 3, '{"type": "xp", "value": 150}', 'medium', true),
  ('Серия побед', 'Продолжайте вашу серию входов 3 дня подряд', 'daily', 'streak', 3, '{"type": "tickets", "value": 1}', 'medium', true),
  ('Пригласи друга', 'Пригласите одного нового пользователя', 'daily', 'referrals', 1, '{"type": "xp", "value": 200}', 'hard', true)
ON CONFLICT DO NOTHING;

-- Weekly Quests
INSERT INTO public."Quest" ("title", "description", "type", "category", "target", "reward", "difficulty", "isActive")
VALUES
  ('Недельный азарт', 'Купите 10 билетов на этой неделе', 'weekly', 'tickets', 10, '{"type": "xp", "value": 500}', 'medium', true),
  ('Мастер рефералов', 'Пригласите 3 новых пользователей на этой неделе', 'weekly', 'referrals', 3, '{"type": "discount", "value": 10}', 'hard', true),
  ('Постоянный игрок', 'Заходите каждый день этой недели', 'weekly', 'streak', 7, '{"type": "tickets", "value": 3}', 'hard', true)
ON CONFLICT DO NOTHING;

-- Monthly Quests
INSERT INTO public."Quest" ("title", "description", "type", "category", "target", "reward", "difficulty", "isActive")
VALUES
  ('Месячный марафон', 'Купите 50 билетов в этом месяце', 'monthly', 'tickets', 50, '{"type": "xp", "value": 2000}', 'hard', true),
  ('Король рефералов', 'Пригласите 10 новых пользователей в этом месяце', 'monthly', 'referrals', 10, '{"type": "tickets", "value": 10}', 'hard', true),
  ('Железная воля', 'Поддерживайте серию входов 30 дней', 'monthly', 'streak', 30, '{"type": "xp", "value": 5000}', 'hard', true)
ON CONFLICT DO NOTHING;

-- Special Quests
INSERT INTO public."Quest" ("title", "description", "type", "category", "target", "reward", "difficulty", "isActive")
VALUES
  ('Первые шаги', 'Купите ваш самый первый билет', 'special', 'tickets', 1, '{"type": "xp", "value": 100}', 'easy', true),
  ('Социальная бабочка', 'Поделитесь вашим реферальным кодом', 'special', 'social', 1, '{"type": "xp", "value": 50}', 'easy', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED ACHIEVEMENTS
-- =====================================================

-- Ticket Purchase Achievements
INSERT INTO public."Achievement" ("name", "title", "description", "category", "tier", "requirement", "reward", "icon", "isActive")
VALUES
  ('first_ticket', 'Первый шаг', 'Купил первый лотерейный билет', 'tickets', 'bronze', '{"type": "tickets_purchased", "value": 1}', '{"type": "xp", "value": 100}', '🎫', true),
  ('ticket_buyer_10', 'Коллекционер', 'Купил 10 лотерейных билетов', 'tickets', 'bronze', '{"type": "tickets_purchased", "value": 10}', '{"type": "xp", "value": 250}', '🎫', true),
  ('ticket_buyer_50', 'Энтузиаст', 'Купил 50 лотерейных билетов', 'tickets', 'silver', '{"type": "tickets_purchased", "value": 50}', '{"type": "xp", "value": 500}', '🎫', true),
  ('ticket_buyer_100', 'Профессионал', 'Купил 100 лотерейных билетов', 'tickets', 'gold', '{"type": "tickets_purchased", "value": 100}', '{"type": "xp", "value": 1000}', '🎫', true),
  ('ticket_buyer_500', 'Мастер удачи', 'Купил 500 лотерейных билетов', 'tickets', 'diamond', '{"type": "tickets_purchased", "value": 500}', '{"type": "tickets", "value": 5}', '💎', true),
  ('ticket_buyer_1000', 'Легенда лотереи', 'Купил 1000 лотерейных билетов', 'tickets', 'platinum', '{"type": "tickets_purchased", "value": 1000}', '{"type": "tickets", "value": 10}', '👑', true)
ON CONFLICT (name) DO NOTHING;

-- Winning Achievements
INSERT INTO public."Achievement" ("name", "title", "description", "category", "tier", "requirement", "reward", "icon", "isActive")
VALUES
  ('first_win', 'Первая победа', 'Выиграл в лотерее первый раз', 'wins', 'bronze', '{"type": "wins_count", "value": 1}', '{"type": "xp", "value": 200}', '🏆', true),
  ('lucky_winner', 'Счастливчик', 'Выиграл 5 раз', 'wins', 'silver', '{"type": "wins_count", "value": 5}', '{"type": "xp", "value": 500}', '🍀', true),
  ('win_master', 'Мастер побед', 'Выиграл 10 раз', 'wins', 'gold', '{"type": "wins_count", "value": 10}', '{"type": "xp", "value": 1000}', '🌟', true),
  ('jackpot_hunter', 'Охотник за джекпотом', 'Выиграл крупный приз', 'wins', 'diamond', '{"type": "jackpot_won", "value": 1}', '{"type": "xp", "value": 5000}', '💰', true)
ON CONFLICT (name) DO NOTHING;

-- Referral Achievements
INSERT INTO public."Achievement" ("name", "title", "description", "category", "tier", "requirement", "reward", "icon", "isActive")
VALUES
  ('first_referral', 'Первый друг', 'Пригласил первого пользователя', 'referrals', 'bronze', '{"type": "referrals_count", "value": 1}', '{"type": "xp", "value": 150}', '🤝', true),
  ('social_networker', 'Социальная сеть', 'Пригласил 5 пользователей', 'referrals', 'silver', '{"type": "referrals_count", "value": 5}', '{"type": "xp", "value": 500}', '👥', true),
  ('influencer', 'Инфлюенсер', 'Пригласил 10 пользователей', 'referrals', 'gold', '{"type": "referrals_count", "value": 10}', '{"type": "tickets", "value": 3}', '📣', true),
  ('ambassador', 'Амбассадор', 'Пригласил 25 пользователей', 'referrals', 'diamond', '{"type": "referrals_count", "value": 25}', '{"type": "tickets", "value": 10}', '🎖️', true),
  ('community_leader', 'Лидер сообщества', 'Пригласил 50 пользователей', 'referrals', 'platinum', '{"type": "referrals_count", "value": 50}', '{"type": "tickets", "value": 25}', '👑', true)
ON CONFLICT (name) DO NOTHING;

-- Streak Achievements
INSERT INTO public."Achievement" ("name", "title", "description", "category", "tier", "requirement", "reward", "icon", "isActive")
VALUES
  ('streak_3', 'На разогреве', 'Серия входов 3 дня', 'streak', 'bronze', '{"type": "streak_days", "value": 3}', '{"type": "xp", "value": 100}', '🔥', true),
  ('streak_7', 'Неделя подряд', 'Серия входов 7 дней', 'streak', 'silver', '{"type": "streak_days", "value": 7}', '{"type": "tickets", "value": 1}', '🔥', true),
  ('streak_14', 'Две недели', 'Серия входов 14 дней', 'streak', 'gold', '{"type": "streak_days", "value": 14}', '{"type": "tickets", "value": 2}', '🔥', true),
  ('streak_30', 'Месяц верности', 'Серия входов 30 дней', 'streak', 'diamond', '{"type": "streak_days", "value": 30}', '{"type": "tickets", "value": 5}', '💎', true),
  ('streak_100', 'Железная воля', 'Серия входов 100 дней', 'streak', 'platinum', '{"type": "streak_days", "value": 100}', '{"type": "tickets", "value": 20}', '👑', true)
ON CONFLICT (name) DO NOTHING;

-- Level Achievements
INSERT INTO public."Achievement" ("name", "title", "description", "category", "tier", "requirement", "reward", "icon", "isActive")
VALUES
  ('level_5', 'Новичок', 'Достиг 5 уровня', 'level', 'bronze', '{"type": "level", "value": 5}', '{"type": "xp", "value": 100}', '⭐', true),
  ('level_10', 'Опытный игрок', 'Достиг 10 уровня', 'level', 'silver', '{"type": "level", "value": 10}', '{"type": "xp", "value": 250}', '⭐', true),
  ('level_25', 'Ветеран', 'Достиг 25 уровня', 'level', 'gold', '{"type": "level", "value": 25}', '{"type": "tickets", "value": 3}', '⭐', true),
  ('level_50', 'Эксперт', 'Достиг 50 уровня', 'level', 'diamond', '{"type": "level", "value": 50}', '{"type": "tickets", "value": 10}', '💎', true),
  ('level_100', 'Гранд-мастер', 'Достиг 100 уровня', 'level', 'platinum', '{"type": "level", "value": 100}', '{"type": "tickets", "value": 50}', '👑', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SEED REWARDS
-- =====================================================

INSERT INTO public."Reward" ("type", "name", "description", "value", "currency", "conditions", "isActive")
VALUES
  ('daily_bonus', 'Ежедневный бонус', 'Базовый ежедневный бонус за вход', 10, NULL, '{"min_level": 1}', true),
  ('level_up', 'Повышение уровня', 'Бонус за повышение уровня', 100, NULL, NULL, true),
  ('first_purchase', 'Первая покупка', 'Бонус за первую покупку билета', 50, NULL, '{"purchase_count": 0}', true),
  ('referral_bonus', 'Бонус за реферала', 'Награда за приглашение друга', 5, NULL, NULL, true),
  ('streak_bonus_3', 'Бонус за серию 3 дня', 'Дополнительный билет за 3 дня подряд', 1, NULL, '{"streak_days": 3}', true),
  ('streak_bonus_7', 'Бонус за серию 7 дней', 'Дополнительные билеты за неделю подряд', 2, NULL, '{"streak_days": 7}', true),
  ('achievement_unlock', 'Разблокировка достижения', 'Награда за разблокировку достижения', 50, NULL, NULL, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Seed Complete
-- =====================================================
