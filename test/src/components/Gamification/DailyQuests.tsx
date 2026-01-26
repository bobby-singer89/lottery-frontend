import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import './DailyQuests.css';

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  completed: boolean;
}

interface DailyQuestsProps {
  quests: Quest[];
  timeUntilReset: number; // seconds
  onQuestComplete?: (questId: string) => void;
}

function DailyQuests({ quests, timeUntilReset }: DailyQuestsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  return (
    <motion.div
      className="daily-quests-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="quests-header">
        <div className="quests-title-section">
          <h3>📋 Ежедневные задания</h3>
          <p className="quests-subtitle">Выполни задания и получи награды!</p>
        </div>
        <div className="reset-timer">
          <Clock size={16} />
          <span>Обновится через {formatTime(timeUntilReset)}</span>
        </div>
      </div>

      <div className="quests-list">
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            className={`quest-item ${quest.completed ? 'completed' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="quest-icon">
              {quest.completed ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle size={24} className="completed-icon" />
                </motion.div>
              ) : (
                <Circle size={24} className="pending-icon" />
              )}
            </div>

            <div className="quest-content">
              <h4 className="quest-title">{quest.title}</h4>
              <p className="quest-description">{quest.description}</p>

              <div className="quest-progress-section">
                <div className="progress-bar-container">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="progress-text">
                  {quest.progress}/{quest.total}
                </span>
              </div>
            </div>

            <div className="quest-reward">
              <div className="reward-badge">
                {quest.completed && <div className="reward-checkmark">✓</div>}
                <span className="reward-amount">{quest.reward}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default DailyQuests;
