import React, { useState, useEffect } from 'react';
import { Player, TeamConstraint, TeamColor } from '../../types';
import { StorageManager } from '../../utils/storage';
import './ConstraintManager.css';

interface ConstraintManagerProps {
  players: Player[];
  onConstraintsChange: (constraints: TeamConstraint[]) => void;
  onClose: () => void;
}

const ConstraintManager: React.FC<ConstraintManagerProps> = ({
  players,
  onConstraintsChange,
  onClose
}) => {
  const [constraints, setConstraints] = useState<TeamConstraint[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newConstraint, setNewConstraint] = useState<Partial<TeamConstraint>>({
    name: '',
    type: 'cannot_play_together',
    playerIds: [],
    restrictedColors: [],
    description: '',
    active: true
  });

  useEffect(() => {
    const data = StorageManager.loadData();
    setConstraints(data.constraints);
  }, []);

  const generateConstraintId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const getConstraintTypeDisplay = (type: TeamConstraint['type']) => {
    switch (type) {
      case 'cannot_play_together':
        return { text: 'Cannot Play Together', icon: '🚫', color: '#F44336' };
      case 'must_play_together':
        return { text: 'Must Play Together', icon: '🤝', color: '#4CAF50' };
      case 'separate_teams':
        return { text: 'Separate Teams', icon: '↔️', color: '#FF9800' };
      case 'cannot_wear_color':
        return { text: 'Cannot Wear Color', icon: '🎨', color: '#9C27B0' };
      default:
        return { text: 'Unknown', icon: '❓', color: '#666666' };
    }
  };

  const handleCreateConstraint = () => {
    if (!newConstraint.name) {
      alert('Please provide a constraint name.');
      return;
    }

    if (newConstraint.type === 'cannot_wear_color') {
      if (!newConstraint.playerIds || newConstraint.playerIds.length < 1) {
        alert('Please select at least 1 player for color constraints.');
        return;
      }
      if (!newConstraint.restrictedColors || newConstraint.restrictedColors.length === 0) {
        alert('Please select at least one restricted color.');
        return;
      }
    } else {
      if (!newConstraint.playerIds || newConstraint.playerIds.length < 2) {
        alert('Please select at least 2 players for this type of constraint.');
        return;
      }
    }

    const constraint: TeamConstraint = {
      id: generateConstraintId(),
      name: newConstraint.name,
      type: newConstraint.type!,
      playerIds: newConstraint.playerIds,
      restrictedColors: newConstraint.restrictedColors,
      description: newConstraint.description || '',
      active: true
    };

    const updatedConstraints = [...constraints, constraint];
    setConstraints(updatedConstraints);
    StorageManager.saveConstraints(updatedConstraints);
    onConstraintsChange(updatedConstraints);

    // Reset form
    setNewConstraint({
      name: '',
      type: 'cannot_play_together',
      playerIds: [],
      restrictedColors: [],
      description: '',
      active: true
    });
    setIsCreating(false);
  };

  const handleToggleConstraint = (constraintId: string) => {
    const updatedConstraints = constraints.map(c =>
      c.id === constraintId ? { ...c, active: !c.active } : c
    );
    setConstraints(updatedConstraints);
    StorageManager.saveConstraints(updatedConstraints);
    onConstraintsChange(updatedConstraints);
  };

  const handleDeleteConstraint = (constraintId: string) => {
    if (window.confirm('Are you sure you want to delete this constraint?')) {
      const updatedConstraints = constraints.filter(c => c.id !== constraintId);
      setConstraints(updatedConstraints);
      StorageManager.saveConstraints(updatedConstraints);
      onConstraintsChange(updatedConstraints);
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    const updatedPlayerIds = newConstraint.playerIds?.includes(playerId)
      ? newConstraint.playerIds.filter(id => id !== playerId)
      : [...(newConstraint.playerIds || []), playerId];

    setNewConstraint({
      ...newConstraint,
      playerIds: updatedPlayerIds
    });
  };

  const handleColorToggle = (color: TeamColor) => {
    const updatedColors = newConstraint.restrictedColors?.includes(color)
      ? newConstraint.restrictedColors.filter(c => c !== color)
      : [...(newConstraint.restrictedColors || []), color];

    setNewConstraint({
      ...newConstraint,
      restrictedColors: updatedColors
    });
  };

  const getColorDisplay = (color: TeamColor) => {
    switch (color) {
      case 'white':
        return { name: 'White Team', color: '#FFFFFF', borderColor: '#E0E0E0', icon: '⚪' };
      case 'colored':
        return { name: 'Colored Team', color: '#4CAF50', borderColor: '#4CAF50', icon: '🟢' };
      case 'black':
        return { name: 'Black Team', color: '#000000', borderColor: '#000000', icon: '⚫' };
    }
  };


  const getPlayersByIds = (playerIds: string[]) => {
    return playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  };

  return (
    <div className="constraint-manager-overlay">
      <div className="constraint-manager">
        <div className="constraint-manager-header">
          <h2>⚖️ Team Constraints</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="constraint-manager-content">
          {/* Existing Constraints */}
          <div className="constraints-section">
            <div className="section-header">
              <h3>Current Constraints ({constraints.length})</h3>
              <button 
                className="create-constraint-button"
                onClick={() => setIsCreating(true)}
                disabled={isCreating}
              >
                ➕ Add Constraint
              </button>
            </div>

            {constraints.length === 0 ? (
              <div className="empty-constraints">
                <div className="empty-icon">⚖️</div>
                <p>No constraints defined yet</p>
                <p className="empty-subtitle">Create constraints to control how teams are formed</p>
              </div>
            ) : (
              <div className="constraints-list">
                {constraints.map(constraint => {
                  const typeDisplay = getConstraintTypeDisplay(constraint.type);
                  const constraintPlayers = getPlayersByIds(constraint.playerIds);

                  return (
                    <div key={constraint.id} className={`constraint-card ${constraint.active ? 'active' : 'inactive'}`}>
                      <div className="constraint-header">
                        <div className="constraint-title">
                          <span 
                            className="constraint-type-icon" 
                            style={{ color: typeDisplay.color }}
                          >
                            {typeDisplay.icon}
                          </span>
                          <div>
                            <h4>{constraint.name}</h4>
                            <span className="constraint-type">{typeDisplay.text}</span>
                          </div>
                        </div>
                        <div className="constraint-actions">
                          <button
                            className={`toggle-button ${constraint.active ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleConstraint(constraint.id)}
                            title={constraint.active ? 'Disable constraint' : 'Enable constraint'}
                          >
                            {constraint.active ? '✅' : '❌'}
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteConstraint(constraint.id)}
                            title="Delete constraint"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="constraint-players">
                        <span className="players-label">Players:</span>
                        <div className="players-list">
                          {constraintPlayers.map(player => (
                            <span key={player.id} className="player-tag">
                              {player.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {constraint.type === 'cannot_wear_color' && constraint.restrictedColors && (
                        <div className="constraint-colors">
                          <span className="colors-label">Restricted Colors:</span>
                          <div className="colors-list">
                            {constraint.restrictedColors.map(color => {
                              const colorDisplay = getColorDisplay(color);
                              return (
                                <span 
                                  key={color} 
                                  className="color-tag"
                                  style={{
                                    backgroundColor: colorDisplay.color,
                                    borderColor: colorDisplay.borderColor,
                                    color: color === 'white' ? '#333' : '#fff'
                                  }}
                                >
                                  {colorDisplay.icon} {colorDisplay.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {constraint.description && (
                        <div className="constraint-description">
                          {constraint.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create New Constraint Form */}
          {isCreating && (
            <div className="create-constraint-form">
              <h3>Create New Constraint</h3>
              
              <div className="form-group">
                <label>Constraint Name</label>
                <input
                  type="text"
                  placeholder="e.g., Experienced Players Separate"
                  value={newConstraint.name}
                  onChange={(e) => setNewConstraint({ ...newConstraint, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Constraint Type</label>
                <select
                  value={newConstraint.type}
                  onChange={(e) => setNewConstraint({ 
                    ...newConstraint, 
                    type: e.target.value as TeamConstraint['type'],
                    restrictedColors: e.target.value === 'cannot_wear_color' ? [] : newConstraint.restrictedColors,
                    playerIds: e.target.value === 'cannot_wear_color' ? newConstraint.playerIds : newConstraint.playerIds
                  })}
                >
                  <option value="cannot_play_together">🚫 Cannot Play Together</option>
                  <option value="must_play_together">🤝 Must Play Together</option>
                  <option value="separate_teams">↔️ Separate Teams</option>
                  <option value="cannot_wear_color">🎨 Cannot Wear Color</option>
                </select>
              </div>

              {newConstraint.type === 'cannot_wear_color' && (
                <div className="form-group">
                  <label>Restricted Colors ({newConstraint.restrictedColors?.length || 0} selected)</label>
                  <div className="color-selection">
                    {(['white', 'colored', 'black'] as TeamColor[]).map(color => {
                      const colorDisplay = getColorDisplay(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          className={`color-selection-button ${newConstraint.restrictedColors?.includes(color) ? 'selected' : ''}`}
                          onClick={() => handleColorToggle(color)}
                          style={{
                            backgroundColor: colorDisplay.color,
                            borderColor: colorDisplay.borderColor,
                            color: color === 'white' ? '#333' : '#fff'
                          }}
                        >
                          <span className="color-icon">{colorDisplay.icon}</span>
                          <span className="color-name">{colorDisplay.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Select Players ({newConstraint.playerIds?.length || 0} selected)</label>
                <div className="players-selection">
                  {players.map(player => (
                    <button
                      key={player.id}
                      className={`player-selection-button ${newConstraint.playerIds?.includes(player.id) ? 'selected' : ''}`}
                      onClick={() => handlePlayerToggle(player.id)}
                    >
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">{player.position}</span>
                      <span className="player-rating">{'★'.repeat(Math.floor(player.rating))}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Additional notes about this constraint..."
                  value={newConstraint.description}
                  onChange={(e) => setNewConstraint({ ...newConstraint, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewConstraint({
                      name: '',
                      type: 'cannot_play_together',
                      playerIds: [],
                      restrictedColors: [],
                      description: '',
                      active: true
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="create-button"
                  onClick={handleCreateConstraint}
                  disabled={
                    !newConstraint.name || 
                    (newConstraint.type === 'cannot_wear_color' 
                      ? (!newConstraint.playerIds || newConstraint.playerIds.length < 1 || !newConstraint.restrictedColors || newConstraint.restrictedColors.length === 0)
                      : (!newConstraint.playerIds || newConstraint.playerIds.length < 2)
                    )
                  }
                >
                  Create Constraint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstraintManager;