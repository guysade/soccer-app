import React, { useState } from 'react';
import { Team } from '../../types';
import './SaveTeamModal.css';

interface SaveTeamModalProps {
  teams: Team[];
  activePlayerIds: string[];
  onSave: (name: string, notes?: string) => void;
  onCancel: () => void;
}

const SaveTeamModal: React.FC<SaveTeamModalProps> = ({
  teams,
  activePlayerIds,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');

  const generateDefaultName = (): string => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `Game - ${dateStr}`;
  };

  const validateName = (value: string): string => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      return 'Selection name is required';
    }

    if (trimmedName.length < 3) {
      return 'Name must be at least 3 characters';
    }

    if (trimmedName.length > 50) {
      return 'Name must be less than 50 characters';
    }

    return '';
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const error = validateName(value);
    setNameError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    onSave(name.trim(), notes.trim() || undefined);
  };

  const handleUseDefaultName = () => {
    const defaultName = generateDefaultName();
    setName(defaultName);
    setNameError('');
  };

  return (
    <div className="save-team-modal-overlay" onClick={onCancel}>
      <div className="save-team-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="save-team-modal-header">
          <h2>Save Team Selection</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="save-team-modal-form">
          <div className="modal-info">
            <p>
              Save this team selection to history. You'll be able to view it later and
              use it to diversify future team generations.
            </p>
            <div className="selection-summary">
              <div className="summary-item">
                <span className="summary-label">Teams:</span>
                <span className="summary-value">{teams.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Players:</span>
                <span className="summary-value">{activePlayerIds.length}</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="selectionName" className="form-label">
              Selection Name *
            </label>
            <div className="name-input-group">
              <input
                id="selectionName"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`form-input ${nameError ? 'error' : ''}`}
                placeholder="e.g., Weekly Game - Jan 15"
                dir="auto"
                required
              />
              <button
                type="button"
                onClick={handleUseDefaultName}
                className="default-name-button"
                title="Use default name"
              >
                Use Default
              </button>
            </div>
            {nameError && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {nameError}
              </div>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="selectionNotes" className="form-label">
              Notes (Optional)
            </label>
            <textarea
              id="selectionNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              placeholder="Add any notes about this game (e.g., weather conditions, special events, etc.)"
              dir="auto"
              rows={3}
              maxLength={200}
            />
            <div className="character-count">
              {notes.length}/200
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={!!nameError || !name.trim()}>
              Save Selection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveTeamModal;
