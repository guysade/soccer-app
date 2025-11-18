import React, { useState } from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'medium'
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const handleClick = (clickedRating: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(clickedRating);
  };

  const handleMouseEnter = (hoveredRating: number) => {
    if (readonly) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(null);
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating !== null ? hoverRating : rating;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = displayRating >= i;
      const isHalfFilled = displayRating >= i - 0.5 && displayRating < i;
      
      // Create clickable areas for full and half stars
      stars.push(
        <div key={i} className="star-container">
          {/* Half star clickable area */}
          <div 
            className="star-half-area"
            onClick={() => handleClick(i - 0.5)}
            onMouseEnter={() => handleMouseEnter(i - 0.5)}
          />
          
          {/* Full star clickable area */}
          <div 
            className="star-full-area"
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
          />
          
          <div className={`star ${size} ${isFilled ? 'filled' : isHalfFilled ? 'half-filled' : 'empty'}`}>
            ⭐
          </div>
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div 
      className={`star-rating ${readonly ? 'readonly' : 'interactive'}`}
      onMouseLeave={handleMouseLeave}
    >
      {renderStars()}
      <span className="rating-value">{rating.toFixed(2)}</span>
    </div>
  );
};

export default StarRating;