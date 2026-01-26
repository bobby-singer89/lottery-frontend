import { motion } from 'framer-motion';
import { Trophy, Star, Award, Crown, Gem } from 'lucide-react';
import './PlayerLevel.css';

export interface PlayerLevelData {
  current: 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';
  xp: number;
  xpToNext: number;
  benefits: string[];
}

interface PlayerLevelProps {
  levelData: PlayerLevelData;
  onLevelUp?: () => void;
}

const levelConfig = {
  bronze: {
    name: 'Bronze',
    icon: Trophy,
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
  },
  silver: {
    name: 'Silver',
    icon: Star,
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
  },
  gold: {
    name: 'Gold',
    icon: Award,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  },
  diamond: {
    name: 'Diamond',
    icon: Gem,
    color: '#B9F2FF',
    gradient: 'linear-gradient(135deg, #B9F2FF 0%, #00CED1 100%)',
  },
  platinum: {
    name: 'Platinum',
    icon: Crown,
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #BCC6CC 100%)',
  },
};

function PlayerLevel({ levelData }: PlayerLevelProps) {
  const currentLevel = levelConfig[levelData.current];
  const IconComponent = currentLevel.icon;
  const progressPercent = (levelData.xp / levelData.xpToNext) * 100;

  return (
    <motion.div
      className="player-level-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="player-level-card">
        <div className="level-header">
          <motion.div
            className="level-icon"
            style={{ background: currentLevel.gradient }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <IconComponent size={32} color="white" />
          </motion.div>
          <div className="level-info">
            <h3 className="level-name">{currentLevel.name}</h3>
            <p className="level-subtitle">Уровень игрока</p>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>XP: {levelData.xp.toLocaleString()}</span>
            <span>{levelData.xpToNext.toLocaleString()}</span>
          </div>
          <div className="progress-bar-container">
            <motion.div
              className="progress-bar"
              style={{ background: currentLevel.gradient }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <div className="progress-shine" />
          </div>
          <p className="progress-text">
            {Math.round(progressPercent)}% до следующего уровня
          </p>
        </div>

        <div className="benefits-section">
          <h4 className="benefits-title">🎁 Преимущества уровня</h4>
          <ul className="benefits-list">
            {levelData.benefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="benefit-check">✓</span>
                {benefit}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default PlayerLevel;
