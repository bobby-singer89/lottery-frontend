import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Ticket, Gift, User, X, LogOut, History, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Footer() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const tabs = [
    { id: 'home', icon: Home, path: '/', label: 'Home' },
    { id: 'tickets', icon: Ticket, path: '/my-tickets', label: 'Tickets' },
    { id: 'rewards', icon: Gift, path: '/rewards', label: 'Rewards' },
    { id: 'profile', icon: User, path: null, label: 'Profile' },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.id === 'profile') {
      setProfileOpen(true);
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'home';

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-t border-white/10 pb-safe">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-around items-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center gap-1 ${
                activeTab === tab.id ? 'text-purple-400' : 'text-gray-500'
              }`}
            >
              <tab.icon size={24} />
              <span className="text-xs">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </footer>

      {/* Profile Bottom Sheet */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setProfileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-gray-900 to-gray-800 rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Profile</h2>
                  <button onClick={() => setProfileOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                {isAuthenticated && user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                        {user.firstName?.[0] || user.username?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{user.firstName || user.username}</p>
                        <p className="text-gray-400 text-sm">Level {user.level || 1}</p>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>XP Progress</span>
                        <span>{user.experience || 0} / 1000</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${((user.experience || 0) / 1000) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2">
                      {[
                        { icon: History, label: 'History', path: '/history' },
                        { icon: Settings, label: 'Settings', path: '/settings' },
                        { icon: HelpCircle, label: 'Help', path: '/faq' },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => { setProfileOpen(false); navigate(item.path); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10"
                        >
                          <item.icon size={20} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Logout */}
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full mt-6 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">Connect your wallet or Telegram to continue</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
