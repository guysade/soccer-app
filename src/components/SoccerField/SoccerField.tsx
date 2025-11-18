import React from 'react';
import { Position } from '../../types';
import './SoccerField.css';

interface SoccerFieldProps {
  selectedPosition?: Position;
  onPositionSelect?: (position: Position) => void;
  readonly?: boolean;
}

const SoccerField: React.FC<SoccerFieldProps> = ({
  selectedPosition,
  onPositionSelect,
  readonly = false
}) => {
  const handlePositionClick = (position: Position) => {
    if (readonly || !onPositionSelect) return;
    onPositionSelect(position);
  };

  const getPositionClass = (position: Position) => {
    const baseClass = `position-area ${position.toLowerCase()}`;
    const selectedClass = selectedPosition === position ? 'selected' : '';
    const interactiveClass = !readonly ? 'interactive' : '';
    return `${baseClass} ${selectedClass} ${interactiveClass}`.trim();
  };

  return (
    <div className="soccer-field">
      <div className="field-background">
        {/* Goal areas */}
        <div className="goal-area top-goal"></div>
        <div className="goal-area bottom-goal"></div>
        
        {/* Center circle */}
        <div className="center-circle"></div>
        <div className="center-line"></div>
        
        {/* Position areas */}
        <div 
          className={getPositionClass('GK')}
          onClick={() => handlePositionClick('GK')}
          title="Goalkeeper"
        >
          <div className="position-icon">🥅</div>
          <div className="position-label">GK</div>
        </div>
        
        <div 
          className={getPositionClass('DEF')}
          onClick={() => handlePositionClick('DEF')}
          title="Defender"
        >
          <div className="position-icon">🛡️</div>
          <div className="position-label">DEF</div>
        </div>
        
        <div 
          className={getPositionClass('MID')}
          onClick={() => handlePositionClick('MID')}
          title="Midfielder"
        >
          <div className="position-icon">⚽</div>
          <div className="position-label">MID</div>
        </div>
        
        <div 
          className={getPositionClass('FWD')}
          onClick={() => handlePositionClick('FWD')}
          title="Forward"
        >
          <div className="position-icon">🎯</div>
          <div className="position-label">FWD</div>
        </div>
      </div>
      
      {selectedPosition && (
        <div className="selected-position-info">
          <span>Selected: {getPositionName(selectedPosition)}</span>
        </div>
      )}
    </div>
  );
};

const getPositionName = (position: Position): string => {
  switch (position) {
    case 'GK': return 'Goalkeeper';
    case 'DEF': return 'Defender';
    case 'MID': return 'Midfielder';
    case 'FWD': return 'Forward';
  }
};

export default SoccerField;