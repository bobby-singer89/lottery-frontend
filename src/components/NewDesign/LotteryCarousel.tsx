import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import LotteryCard, { type LotteryCardData } from './LotteryCard';
import './LotteryCarousel.css';

interface LotteryCarouselProps {
  lotteries: LotteryCardData[];
}

const LotteryCarousel: React.FC<LotteryCarouselProps> = ({ lotteries }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < lotteries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: true,
    trackTouch: true,
  });

  const getCardStyle = (index: number) => {
    const offset = index - currentIndex;
    
    return {
      position: 'absolute' as const,
      left: '50%',
      transform: `translateX(-50%) translateX(${offset * 300}px) scale(${offset === 0 ? 1 : 0.85})`,
      opacity: Math.abs(offset) > 1 ? 0 : offset === 0 ? 1 : 0.5,
      zIndex: offset === 0 ? 10 : 5 - Math.abs(offset),
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: offset === 0 ? 'auto' as const : 'none' as const,
    };
  };

  return (
    <div className="lottery-carousel-container">
      <div className="carousel-header">
        <h2 className="carousel-title">Featured Lotteries</h2>
        <div className="carousel-dots">
          {lotteries.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to lottery ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div 
        className="lottery-carousel"
        {...swipeHandlers}
      >
        {lotteries.map((lottery, index) => (
          <div
            key={lottery.id}
            style={getCardStyle(index)}
          >
            <LotteryCard 
              lottery={lottery} 
              isCenter={index === currentIndex}
            />
          </div>
        ))}
      </div>

      <div className="carousel-nav">
        <button 
          className="nav-btn prev"
          onClick={() => handleSwipe('right')}
          disabled={currentIndex === 0}
        >
          ‹
        </button>
        <button 
          className="nav-btn next"
          onClick={() => handleSwipe('left')}
          disabled={currentIndex === lotteries.length - 1}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default LotteryCarousel;
