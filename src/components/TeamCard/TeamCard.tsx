import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Team, Player } from '../../types';
import StarRating from '../StarRating';
import DraggablePlayer from './DraggablePlayer';
import './TeamCard.css';

interface TeamCardProps {
  team: Team;
  onPlayerClick?: (player: Player) => void;
  selectedPlayerId?: string | null;
  switchMode?: boolean;
  dragMode?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onPlayerClick, selectedPlayerId, switchMode, dragMode = false }) => {
  const getPositionStats = () => {
    const stats = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    team.players.forEach(player => {
      stats[player.position]++;
    });
    return stats;
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'GK': return '🥅';
      case 'DEF': return '🛡️';
      case 'MID': return '⚽';
      case 'FWD': return '🎯';
      default: return '⚽';
    }
  };

  const positionStats = getPositionStats();
  
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${team.id}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`team-card ${isOver && dragMode ? 'drag-over' : ''}`} 
      style={{ 
        '--team-color': team.color,
        '--team-border-color': team.borderColor || team.color
      } as React.CSSProperties}
    >
      <div className="team-header">
        <div className="team-name-section">
          <h2 className="team-name">{team.name}</h2>
          <div className="team-stats">
            <div className="player-count">{team.players.length} players</div>
            <div className="average-rating">
              <StarRating rating={team.averageRating} readonly size="small" />
            </div>
          </div>
        </div>
        <div className="team-color-indicator"></div>
      </div>

      <div className="position-distribution">
        {Object.entries(positionStats).map(([position, count]) => (
          count > 0 && (
            <div key={position} className="position-stat">
              <span className="position-icon">{getPositionIcon(position)}</span>
              <span className="position-count">{count}</span>
            </div>
          )
        ))}
      </div>

      <div className="players-list">
        {[...team.players].sort((a, b) => b.rating - a.rating).map((player) => {
          const isSelected = selectedPlayerId === player.id;
          
          if (dragMode) {
            return (
              <DraggablePlayer 
                key={player.id} 
                player={player}
                teamId={team.id}
                getPositionIcon={getPositionIcon}
              />
            );
          }
          
          const playerInitials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();
          const isClickable = switchMode && onPlayerClick;
          
          return (
            <div 
              key={player.id} 
              className={`team-player ${isClickable ? 'clickable' : ''} ${isSelected ? 'selected' : ''} ${switchMode ? 'switch-mode' : ''}`}
              onClick={() => onPlayerClick?.(player)}
            >
              <div className="player-mini-avatar">
                {playerInitials}
                {isSelected && <div className="selection-indicator">✓</div>}
              </div>
              <div className="player-mini-info">
                <span className="player-mini-name" dir="auto">{player.name}</span>
                <div className="player-mini-details">
                  <span className="player-position">{getPositionIcon(player.position)} {player.position}</span>
                  <StarRating rating={player.rating} readonly size="small" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {team.players.length === 0 && (
        <div className="empty-team">
          <span className="empty-icon">👥</span>
          <span className="empty-text">No players assigned</span>
        </div>
      )}
    </div>
  );
};

export default TeamCard;