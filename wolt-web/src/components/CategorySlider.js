import React from 'react';
import './CategorySlider.css';

function CategorySlider({ restaurants = [] }) {
  // Dynamically extract unique categories from the fetched restaurants list
  const uniqueCategories = Array.from(
    new Set(restaurants.map((res) => res.category).filter(Boolean))
  );

  // Fallback default categories if the restaurant list is still loading or empty
  const displayCategories = uniqueCategories.length > 0 
    ? uniqueCategories 
    : ['Burgers', 'Pizza', 'Asian', 'Bakery', 'Desserts', 'Salads'];

  // Helper function to return a matching emoji based on the category name
  const getCategoryEmoji = (category) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('burger')) return '🍔';
    if (lowerCategory.includes('piz')) return '🍕';
    if (lowerCategory.includes('bakery') || lowerCategory.includes('cafe') || lowerCategory.includes('bread')) return '🥐';
    if (lowerCategory.includes('sushi') || lowerCategory.includes('asian')) return '🍣';
    if (lowerCategory.includes('dessert') || lowerCategory.includes('sweet')) return '🍰';
    return '🍽️'; // Default fallback icon
  };

  return (
    <div className="category-slider-container">
      <div className="category-slider-header">
        <h2 className="category-title">What are you craving today?</h2>
      </div>
      
      {/* Horizontal scrollable container for categories */}
      <div className="category-list">
        {displayCategories.map((category, index) => (
          <div key={index} className="category-item">
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