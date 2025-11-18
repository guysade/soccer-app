import React from 'react';
import { Player, Position } from '../../types';
import StarRating from '../StarRating';
import './PlayerCard.css';

interface PlayerCardProps {
  player: Player;
  onEdit?: (player: Player) => void;
  onToggleActive?: (playerId: string) => void;
  onRatingChange?: (playerId: string, rating: number) => void;
  compact?: boolean;
  showActions?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onEdit,
  onToggleActive,
  onRatingChange,
  compact = false,
  showActions = true
}) => {
  const getPositionInfo = (position: Position) => {
    switch (position) {
      case 'GK': return { name: 'Goalkeeper', icon: '🥅', color: '#FF5722' };
      case 'DEF': return { name: 'Defender', icon: '🛡️', color: '#2196F3' };
      case 'MID': return { name: 'Midfielder', icon: '⚽', color: '#4CAF50' };
      case 'FWD': return { name: 'Forward', icon: '🎯', color: '#FF9800' };
    }
  };

  const positionInfo = getPositionInfo(player.position);
  const playerInitials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`player-card ${compact ? 'compact' : ''} ${!player.active ? 'inactive' : ''}`}>
      <div className="player-avatar">
        <div className="avatar-circle" style={{ backgroundColor: positionInfo.color }}>
          {playerInitials}
        </div>
        <div className="position-badge">
          <span className="position-icon">{positionInfo.icon}</span>
        </div>
      </div>
      
      <div className="player-info">
        <h3 className="player-name" dir="auto">{player.name}</h3>
        <div className="position-name">{positionInfo.name}</div>
        
        <div className="rating-section">
          <StarRating 
            rating={player.rating}
            onRatingChange={onRatingChange ? (rating) => onRatingChange(player.id, rating) : undefined}
            readonly={!onRatingChange}
            size="small"
          />
        </div>
        
        {player.conflicts.length > 0 && (
          <div className="conflicts-indicator">
            <span className="conflicts-icon">⚠️</span>
            <span className="conflicts-count">{player.conflicts.length} conflicts</span>
          </div>
        )}
      </div>
      
      {showActions && (
        <div className="player-actions">
          <button 
            className={`active-toggle ${player.active ? 'active' : 'inactive'}`}
            onClick={() => onToggleActive?.(player.id)}
            title={player.active ? 'Mark as absent' : 'Click to return player'}
          >
            {player.active ? '✅' : '🔄'}
          </button>
          
          {onEdit && (
            <button 
              className="edit-button"
              onClick={() => onEdit(player)}
              title="Edit player"
            >
              ✏️
            </button>
          )}
        </div>
      )}
      
      {!player.active && (
        <div className="inactive-overlay">
          <span>Absent</span>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;