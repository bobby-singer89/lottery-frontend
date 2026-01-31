import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface AchievementsCardProps {
  achievements: Achievement[] | null;
  isLoading: boolean;
}

function AchievementsCard({ achievements, isLoading }: AchievementsCardProps) {
  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="card-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2 className="card-title">🏆 Achievements</h2>
      
      <div className="achievements-list">
        {achievements?.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-desc">{achievement.description}</div>
              {!achievement.unlocked && (
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {achievement.progress} / {achievement.target}
                  </div>
                </div>
              )}
            </div>
            {achievement.unlocked && (
              <div className="achievement-badge">✓</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AchievementsCard;
