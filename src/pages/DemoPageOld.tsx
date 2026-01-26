import { useState } from 'react';
import { motion } from 'framer-motion';
import PlayerLevel, { type PlayerLevelData } from '../components/Gamification/PlayerLevel';
import StreakCounter from '../components/Gamification/StreakCounter';
import DailyQuests, { type Quest } from '../components/Gamification/DailyQuests';
import AchievementBadges, { type Achievement } from '../components/Gamification/AchievementBadges';
import CountdownTimer from '../components/Statistics/CountdownTimer';
import LivePrizeCounter from '../components/Statistics/LivePrizeCounter';
import Leaderboard, { type LeaderboardEntry } from '../components/Social/Leaderboard';
import ParticleBackground from '../components/Animations/ParticleBackground';
import SkeletonLoader from '../components/Animations/SkeletonLoader';
import './DemoPage.css';

function DemoPage() {
  const [showSkeletons, setShowSkeletons] = useState(false);

  // Mock data
  const playerLevel: PlayerLevelData = {
    current: 'gold',
    xp: 7500,
    xpToNext: 10000,
    benefits: [
      'Скидка 10% на все билеты',
      'Приоритетная поддержка',
      'Эксклюзивные лотереи',
      'Удвоенный XP от покупок',
    ],
  };

  const streakHistory = [true, true, true, true, true, false, false];
  const currentStreak = 5;

  const quests: Quest[] = [
    {
      id: '1',
      title: 'Купи 3 билета',
      description: 'Приобрети 3 билета сегодня',
      reward: '+10 TON',
      progress: 2,
      total: 3,
      completed: false,
    },
    {
      id: '2',
      title: 'Войди 3 дня подряд',
      description: 'Заходи в приложение 3 дня подряд',
      reward: '+5 TON',
      progress: 3,
      total: 3,
      completed: true,
    },
    {
      id: '3',
      title: 'Пригласи друга',
      description: 'Пригласи 1 друга через реферальную ссылку',
      reward: '+20 TON',
      progress: 0,
      total: 1,
      completed: false,
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Первый билет',
      description: 'Купи свой первый лотерейный билет',
      icon: '🎫',
      unlocked: true,
      unlockedAt: new Date('2026-01-20'),
    },
    {
      id: '2',
      title: '10 билетов',
      description: 'Купи 10 лотерейных билетов',
      icon: '🎰',
      unlocked: true,
      unlockedAt: new Date('2026-01-22'),
    },
    {
      id: '3',
      title: 'Первый выигрыш',
      description: 'Выиграй свою первую лотерею',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      total: 1,
    },
    {
      id: '4',
      title: 'Большой выигрыш',
      description: 'Выиграй 100+ TON',
      icon: '💎',
      unlocked: false,
      progress: 0,
      total: 100,
    },
    {
      id: '5',
      title: '7 дней streak',
      description: 'Заходи 7 дней подряд',
      icon: '🔥',
      unlocked: false,
      progress: 5,
      total: 7,
    },
    {
      id: '6',
      title: 'Пригласи 5 друзей',
      description: 'Пригласи 5 друзей по реферальной программе',
      icon: '👥',
      unlocked: false,
      progress: 2,
      total: 5,
    },
  ];

  const leaderboardEntries: LeaderboardEntry[] = [
    { rank: 1, username: 'CryptoKing', totalWinnings: 15000, level: 'Platinum' },
    { rank: 2, username: 'LuckyPlayer', totalWinnings: 12500, level: 'Diamond' },
    { rank: 3, username: 'TONMaster', totalWinnings: 10000, level: 'Gold' },
    { rank: 4, username: 'WinnerPro', totalWinnings: 8500, level: 'Gold' },
    { rank: 5, username: 'BlockchainFan', totalWinnings: 7200, level: 'Silver' },
    { rank: 6, username: 'User123', totalWinnings: 6100, level: 'Silver' },
    { rank: 7, username: 'LotteryLover', totalWinnings: 5500, level: 'Bronze' },
    { rank: 8, username: 'CryptoWhale', totalWinnings: 4800, level: 'Bronze' },
    { rank: 9, username: 'YouCurrentUser', totalWinnings: 4200, level: 'Bronze' },
    { rank: 10, username: 'NewPlayer', totalWinnings: 3500, level: 'Bronze' },
  ];

  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 24);

  return (
    <div className="demo-page">
      <ParticleBackground particleCount={20} enabled={true} />

      <div className="demo-content">
        <motion.div
          className="demo-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🎮 Демо новых компонентов</h1>
          <p className="demo-subtitle">
            Посмотрите все новые функции лотерейного приложения
          </p>
          <button
            className="skeleton-toggle"
            onClick={() => setShowSkeletons(!showSkeletons)}
          >
            {showSkeletons ? 'Показать компоненты' : 'Показать скелетоны'}
          </button>
        </motion.div>

        {showSkeletons ? (
          <div className="skeletons-demo">
            <h2>Skeleton Loaders</h2>
            <SkeletonLoader type="lottery-card" count={3} />
            <SkeletonLoader type="list-item" count={5} />
            <SkeletonLoader type="leaderboard" count={3} />
          </div>
        ) : (
          <>
            <section className="demo-section">
              <h2>📊 Живая статистика</h2>
              <div className="components-grid">
                <LivePrizeCounter value={1234567} currency="TON" updateInterval={3000} />
                <CountdownTimer targetDate={targetDate} />
              </div>
            </section>

            <section className="demo-section">
              <h2>🎯 Геймификация</h2>
              <PlayerLevel levelData={playerLevel} />
              <StreakCounter currentStreak={currentStreak} streakHistory={streakHistory} />
              <DailyQuests quests={quests} timeUntilReset={18000} />
              <AchievementBadges achievements={achievements} />
            </section>

            <section className="demo-section">
              <h2>👥 Социальные функции</h2>
              <Leaderboard entries={leaderboardEntries} currentUserRank={9} />
            </section>

            <section className="demo-section">
              <h2>ℹ️ Информация</h2>
              <div className="info-card">
                <h3>✅ Реализованные компоненты (Phase 1-2)</h3>
                <ul>
                  <li>✓ PlayerLevel - Система уровней игрока</li>
                  <li>✓ StreakCounter - Счетчик дней подряд</li>
                  <li>✓ DailyQuests - Ежедневные задания</li>
                  <li>✓ AchievementBadges - Коллекция достижений</li>
                  <li>✓ CountdownTimer - Таймер обратного отсчета</li>
                  <li>✓ LivePrizeCounter - Анимированный счетчик призов</li>
                  <li>✓ ParticleBackground - Фоновые частицы</li>
                  <li>✓ SkeletonLoader - Skeleton loaders</li>
                  <li>✓ Leaderboard - Таблица лидеров</li>
                  <li>✓ SoundManager - Система звуков (в контексте)</li>
                  <li>✓ i18n - Мультиязычность (RU/EN)</li>
                </ul>
                <p className="info-note">
                  📝 Все компоненты добавлены БЕЗ изменения существующего кода!
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default DemoPage;
