import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  categories: Category[];
  activeIndex: number;
  onCategoryChange: (index: number) => void;
}

export default function FAQSwipeCategories({ categories, activeIndex, onCategoryChange }: Props) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeIndex < categories.length - 1) {
      onCategoryChange(activeIndex + 1);
    }
    
    if (isRightSwipe && activeIndex > 0) {
      onCategoryChange(activeIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="faq-swipe-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="faq-category-slider"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {categories.map((category, index) => (
          <div 
            key={category.id}
            className={`category-slide ${index === activeIndex ? 'active' : ''}`}
          >
            <div className="category-icon">{category.icon}</div>
            <h3 className="category-name">{category.name}</h3>
          </div>
        ))}
      </div>
      
      <div className="category-dots">
        {categories.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onCategoryChange(index)}
            aria-label={`Go to ${categories[index].name} category`}
          />
        ))}
      </div>
    </div>
  );
}
