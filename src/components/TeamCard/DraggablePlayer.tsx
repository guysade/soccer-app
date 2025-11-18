import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player } from '../../types';
import StarRating from '../StarRating';

interface DraggablePlayerProps {
  player: Player;
  teamId: string;
  getPositionIcon: (position: string) => string;
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player, teamId, getPositionIcon }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: {
      player,
      sourceTeamId: teamId,
    },
  });

  const playerInitials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`team-player draggable-player ${isDragging ? 'dragging' : ''}`}
    >
      <div className="player-mini-avatar">
        {playerInitials}
      </div>
      <div className="player-mini-info">
        <span className="player-mini-name" dir="auto">{player.name}</span>
        <div className="player-mini-details">
          <span className="player-position">{getPositionIcon(player.position)} {player.position}</span>
          <StarRating rating={player.rating} readonly size="small" />
        </div>
      </div>
      <div className="drag-handle">⋮⋮</div>
    </div>
  );
};

export default DraggablePlayer;