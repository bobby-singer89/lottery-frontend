import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Ticket, Gift, User, X, TrendingUp, Zap, Award, Settings, HelpCircle, LogOut, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface User {
  id: number;
  username?: string;
  firstName?: string;
  photoUrl?: string;
  level: string;
  experience: number;
}

interface FooterProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Footer({ user, onLogout }: FooterProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  const handleTabClick = (tab: string) => {
    if (tab === 'profile') {
      setShowProfileSheet(true);
    } else {
      setActiveTab(tab);
      // Navigation logic would go here
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tickets', icon: Ticket, label: 'Tickets' },
    { id: 'rewards', icon: Gift, label: 'Rewards' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  // Calculate XP progress
  const currentLevel = parseInt(user?.level || '1', 10);
  const currentXP = user?.experience || 0;
  const nextLevelXP = currentLevel * 1000; // Simple calculation
  const xpProgress = (currentXP / nextLevelXP) * 100;

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
        style={{
          background: 'var(--glass-background)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-3 relative">
            {/* Animated active indicator */}
            <motion.div
              className="absolute top-0 h-1 rounded-full"
              style={{
                background: 'var(--theme-accent-gradient)',
                width: `${100 / navItems.length}%`,
              }}
              initial={false}
              animate={{
                left: `${navItems.findIndex((item) => item.id === activeTab) * (100 / navItems.length)}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              layoutId="tab-indicator"
            />

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="flex flex-col items-center gap-1 px-4 py-2 relative"
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon
                    size={24}
                    color={isActive ? 'var(--theme-neon-color)' : 'var(--text-secondary)'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isActive ? 'var(--theme-neon-color)' : 'var(--text-secondary)',
                    }}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Profile Bottom Sheet */}
      <AnimatePresence>
        {showProfileSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileSheet(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-safe"
              style={{
                background: 'var(--glass-background)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={() => setShowProfileSheet(false)}
                  className="absolute top-4 right-4 p-2 rounded-full"
                  style={{
                    background: 'var(--glass-background)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <X size={20} color="var(--text-primary)" />
                </button>

                {user ? (
                  <>
                    {/* User Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.username || 'User'}
                            className="w-16 h-16 rounded-full"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                            style={{
                              background: 'var(--theme-accent-gradient)',
                            }}
                          >
                            {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                        {/* Level badge */}
                        <div
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                          style={{
                            background: 'var(--theme-button-gradient)',
                            borderColor: 'var(--glass-background)',
                          }}
                        >
                          {currentLevel}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          {user.firstName || user.username || 'User'}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Level {currentLevel}
                        </p>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span style={{ color: 'var(--text-secondary)' }}>Experience</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {currentXP} / {nextLevelXP} XP
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: 'var(--glass-background)' }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'var(--theme-accent-gradient)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { label: 'Balance', value: '0 TON', icon: Wallet },
                        { label: 'Streak', value: '0 days', icon: Zap },
                        { label: 'Tickets', value: '0', icon: Ticket },
                        { label: 'Wins', value: '0', icon: Award },
                      ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl"
                            style={{
                              background: 'var(--glass-background)',
                              border: '1px solid var(--glass-border)',
                            }}
                          >
                            <Icon size={20} color="var(--theme-neon-color)" className="mb-2" />
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                              {stat.value}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {stat.label}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3 mb-6">
                      {[
                        { label: 'Deposit', icon: ArrowDownToLine },
                        { label: 'Withdraw', icon: ArrowUpFromLine },
                        { label: 'Bonuses', icon: Gift },
                      ].map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.label}
                            className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold"
                            style={{
                              background: 'var(--theme-button-gradient)',
                              color: '#fff',
                            }}
                          >
                            <Icon size={18} />
                            <span className="text-sm">{action.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2 mb-6">
                      {[
                        { label: 'Transaction History', icon: TrendingUp },
                        { label: 'Notifications', icon: Gift },
                        { label: 'Settings', icon: Settings },
                        { label: 'Help & Support', icon: HelpCircle },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            className="w-full p-4 rounded-xl flex items-center gap-3 transition-colors"
                            style={{
                              background: 'var(--glass-background)',
                              border: '1px solid var(--glass-border)',
                            }}
                          >
                            <Icon size={20} color="var(--text-primary)" />
                            <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <button
                      onClick={onLogout}
                      className="w-full p-4 rounded-xl flex items-center justify-center gap-2 font-semibold"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }}
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </>
                ) : (
                  /* Guest View */
                  <div className="text-center py-8">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{
                        background: 'var(--glass-background)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <User size={40} color="var(--text-secondary)" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Welcome to Weekend Millions
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Connect your wallet to get started
                    </p>
                    <button
                      className="px-8 py-3 rounded-xl font-semibold"
                      style={{
                        background: 'var(--theme-button-gradient)',
                        color: '#fff',
                      }}
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
              <div className="h-safe-area-inset-bottom" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
