import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import './AchievementBadges.css';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  unlockedAt?: Date;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  onBadgeClick?: (achievement: Achievement) => void;
}

function AchievementBadges({ achievements, onBadgeClick }: AchievementBadgesProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const handleBadgeClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    onBadgeClick?.(achievement);

    if (achievement.unlocked) {
      // Trigger confetti for unlocked achievements
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <motion.div
      className="achievements-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="achievements-header">
        <h3>🏆 Достижения</h3>
        <div className="achievements-progress">
          <span className="progress-count">
            {unlockedCount}/{totalCount}
          </span>
          <div className="mini-progress-bar">
            <motion.div
              className="mini-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      <div className="badges-grid">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={`badge-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={() => handleBadgeClick(achievement)}
          >
            <div className="badge-icon-container">
              <div className="badge-icon">{achievement.icon}</div>
              {achievement.unlocked && <div className="badge-shine" />}
            </div>
            <div className="badge-title">{achievement.title}</div>
            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="badge-progress-text">
                {achievement.progress}/{achievement.total}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="achievement-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className="achievement-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedAchievement(null)}
              >
                <X size={24} />
              </button>

              <div className="modal-icon-large">{selectedAchievement.icon}</div>

              <h2 className="modal-title">{selectedAchievement.title}</h2>
              <p className="modal-description">{selectedAchievement.description}</p>

              {selectedAchievement.unlocked ? (
                <div className="modal-unlocked">
                  <div className="unlocked-badge">✓ Получено!</div>
                  {selectedAchievement.unlockedAt && (
                    <p className="unlock-date">
                      {new Date(selectedAchievement.unlockedAt).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="modal-locked">
                  <div className="locked-badge">🔒 Заблокировано</div>
                  {selectedAchievement.progress !== undefined && (
                    <div className="modal-progress">
                      <div className="modal-progress-bar">
                        <motion.div
                          className="modal-progress-fill"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              ((selectedAchievement.progress || 0) /
                                (selectedAchievement.total || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="modal-progress-text">
                        {selectedAchievement.progress}/{selectedAchievement.total} до получения
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AchievementBadges;
