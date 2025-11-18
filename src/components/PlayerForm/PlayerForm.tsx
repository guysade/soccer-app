import React, { useState, useEffect } from 'react';
import { Player, Position } from '../../types';
import StarRating from '../StarRating';
import SoccerField from '../SoccerField';
import './PlayerForm.css';

interface PlayerFormProps {
  player?: Player;
  allPlayers: Player[];
  onSave: (player: Omit<Player, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ 
  player, 
  allPlayers, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    rating: 3,
    position: 'MID' as Position,
    conflicts: [] as string[],
    active: true
  });
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        rating: player.rating,
        position: player.position,
        conflicts: [...player.conflicts],
        active: player.active
      });
    }
  }, [player]);

  const validatePlayerName = (name: string): string => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Player name is required';
    }
    
    // Check for duplicate names (case-insensitive, ignoring current player being edited)
    const existingPlayer = allPlayers.find(p => 
      p.id !== player?.id && 
      p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingPlayer) {
      return `A player named "${existingPlayer.name}" already exists`;
    }
    
    return '';
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    
    // Clear previous error and validate new name
    const error = validatePlayerName(name);
    setNameError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    
    // Final validation before submit
    const error = validatePlayerName(formData.name);
    
    if (error) {
      setNameError(error);
      return;
    }
    
    if (trimmedName) {
      onSave({
        ...formData,
        name: trimmedName,
        id: player?.id
      });
    }
  };

  const handleConflictToggle = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      conflicts: prev.conflicts.includes(playerId)
        ? prev.conflicts.filter(id => id !== playerId)
        : [...prev.conflicts, playerId]
    }));
  };

  const availableForConflicts = allPlayers.filter(p => p.id !== player?.id);

  return (
    <div className="player-form-overlay">
      <div className="player-form-container">
        <div className="player-form-header">
          <h2>{player ? 'Edit Player' : 'Add New Player'}</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="player-form">
          <div className="form-section">
            <label htmlFor="playerName" className="form-label">
              Player Name *
            </label>
            <input
              id="playerName"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`form-input ${nameError ? 'error' : ''}`}
              placeholder="Enter player name (Hebrew supported)"
              dir="auto"
              required
            />
            {nameError && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {nameError}
              </div>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">Player Rating</label>
            <div className="rating-input">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size="large"
              />
              <span className="rating-help">Click to set rating (supports half-stars)</span>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Position</label>
            <div className="position-selector">
              <SoccerField
                selectedPosition={formData.position}
                onPositionSelect={(position) => setFormData(prev => ({ ...prev, position }))}
              />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="checkbox-input"
              />
              Available this week
            </label>
          </div>

          {availableForConflicts.length > 0 && (
            <div className="form-section">
              <label className="form-label">
                Conflicts (players who cannot be on the same team)
              </label>
              <div className="conflicts-list">
                {availableForConflicts.map(conflictPlayer => (
                  <label key={conflictPlayer.id} className="conflict-item">
                    <input
                      type="checkbox"
                      checked={formData.conflicts.includes(conflictPlayer.id)}
                      onChange={() => handleConflictToggle(conflictPlayer.id)}
                      className="checkbox-input"
                    />
                    <span className="conflict-name" dir="auto">{conflictPlayer.name}</span>
                    <span className="conflict-position">({conflictPlayer.position})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={!!nameError || !formData.name.trim()}>
              {player ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerForm;