import React from 'react';
import './CategorySlider.css';

function CategorySlider({ restaurants = [], selectedCategory, onSelectCategory }) {
  const uniqueCategories = Array.from(
    new Set(restaurants.map((res) => res.category).filter(Boolean))
  );

  const getCategoryStyle = (category, index) => {
    const lowerCategory = category.toLowerCase();
    let emoji = '🍽️';
    if (lowerCategory.includes('burger')) emoji = '🍔';
    else if (lowerCategory.includes('piz')) emoji = '🍕';
    else if (lowerCategory.includes('bakery') || lowerCategory.includes('cafe') || lowerCategory.includes('bread')) emoji = '🥐';
    else if (lowerCategory.includes('sushi') || lowerCategory.includes('asian')) emoji = '🍣';
    else if (lowerCategory.includes('dessert') || lowerCategory.includes('sweet')) emoji = '🍰';
    else {
      const fallbackEmojis = ['🥗', '🍲', '🌮', '🍿', '🥤', '🥩'];
      emoji = fallbackEmojis[index % fallbackEmojis.length];
    }
    return { emoji, bg: `var(--cat-bg-${index % 6})` };
  };

  return (
    <div className="category-slider-container">
      <div className="category-slider-header">
        <h2 className="category-title">What are you craving today?</h2>
      </div>

      <div className="category-list">
        <div
          className={`category-item ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <div className="category-img-wrapper" style={{ backgroundColor: 'var(--cat-bg-all)' }}>
            <span className="category-emoji-icon">🍱</span>
          </div>
          <span>All</span>
        </div>

        {uniqueCategories.map((category, index) => {
          const { emoji, bg } = getCategoryStyle(category, index);
          return (
            <div
              key={index}
              className={`category-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              <div className="category-img-wrapper" style={{ backgroundColor: bg }}>
                <span className="category-emoji-icon">{emoji}</span>
              </div>
              <span>{category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySlider;