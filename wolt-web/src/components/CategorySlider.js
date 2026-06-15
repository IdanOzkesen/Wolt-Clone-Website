import React from 'react';
import './CategorySlider.css';

function CategorySlider({ restaurants = [], selectedCategory, onSelectCategory }) {
  // Dynamically extract unique categories from the fetched restaurants list
  const uniqueCategories = Array.from(
    new Set(restaurants.map((res) => res.category).filter(Boolean))
  );

  // Helper function to return a matching emoji based on the category name
  const getCategoryEmoji = (category) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('burger')) return '🍔';
    if (lowerCategory.includes('piz')) return '🍕';
    if (lowerCategory.includes('bakery') || lowerCategory.includes('cafe') || lowerCategory.includes('bread')) return '🥐';
    if (lowerCategory.includes('sushi') || lowerCategory.includes('asian')) return '🍣';
    if (lowerCategory.includes('dessert') || lowerCategory.includes('sweet')) return '🍰';
    return '🍽️';
  };

  return (
    <div className="category-slider-container">
      <div className="category-slider-header">
        <h2 className="category-title">What are you craving today?</h2>
      </div>
      
      <div className="category-list">
        {/* "All" button to clear the category filter and show everything */}
        <div 
          className={`category-item ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <div className="category-img-wrapper">
            <span className="category-emoji-icon">🍱</span>
          </div>
          <span>All</span>
        </div>

        {/* Dynamic categories map */}
        {uniqueCategories.map((category, index) => (
          <div 
            key={index} 
            className={`category-item ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            <div className="category-img-wrapper">
              <span className="category-emoji-icon">{getCategoryEmoji(category)}</span>
            </div>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategorySlider;