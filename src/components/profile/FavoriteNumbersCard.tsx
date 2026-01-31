import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FavoriteNumber {
  number: number;
  frequency: number;
}

interface FavoriteNumbersCardProps {
  favoriteNumbers: FavoriteNumber[] | null;
  isLoading: boolean;
}

function FavoriteNumbersCard({ favoriteNumbers, isLoading }: FavoriteNumbersCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="card-loading">Loading...</div>
      </div>
    );
  }

  const maxFrequency = favoriteNumbers && favoriteNumbers.length > 0
    ? Math.max(...favoriteNumbers.map(n => n.frequency))
    : 1;

  const handleQuickPick = () => {
    if (favoriteNumbers && favoriteNumbers.length > 0) {
      const numbers = favoriteNumbers.slice(0, 5).map(fn => fn.number);
      // Store the numbers in sessionStorage for the buy page
      sessionStorage.setItem('quickPickNumbers', JSON.stringify(numbers));
      navigate('/lotteries');
    }
  };

  return (
    <div className="profile-card">
      <h2 className="card-title">⭐ Favorite Numbers</h2>
      
      {favoriteNumbers && favoriteNumbers.length > 0 ? (
        <>
          <div className="favorite-numbers-list">
            {favoriteNumbers.map((fn, index) => (
              <motion.div
                key={fn.number}
                className="favorite-number-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="number-badge">{fn.number}</div>
                <div className="number-info">
                  <div className="number-freq">Picked {fn.frequency} times</div>
                  <div className="freq-bar">
                    <div 
                      className="freq-fill"
                      style={{ 
                        width: `${Math.min(100, (fn.frequency / maxFrequency) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="quick-pick-btn"
            onClick={handleQuickPick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎯 Quick Pick These Numbers
          </motion.button>
        </>
      ) : (
        <div className="no-data">
          <p>No favorite numbers yet</p>
          <p className="hint">Play some tickets to see your most picked numbers!</p>
        </div>
      )}
    </div>
  );
}

export default FavoriteNumbersCard;
