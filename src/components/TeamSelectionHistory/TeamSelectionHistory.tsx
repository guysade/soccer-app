import React, { useState } from 'react';
import { TeamSelection, Player } from '../../types';
import './TeamSelectionHistory.css';

interface TeamSelectionHistoryProps {
  history: TeamSelection[];
  allPlayers: Player[];
  onLoad: (selection: TeamSelection) => void;
  onDelete: (selectionId: string) => void;
  onClose: () => void;
}

const TeamSelectionHistory: React.FC<TeamSelectionHistoryProps> = ({
  history,
  allPlayers,
  onLoad,
  onDelete,
  onClose
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const toggleExpand = (selectionId: string) => {
    setExpandedId(expandedId === selectionId ? null : selectionId);
  };

  const handleDelete = (selectionId: string) => {
    onDelete(selectionId);
    setDeleteConfirmId(null);
    if (expandedId === selectionId) {
      setExpandedId(null);
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-container" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>Team Selection History</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="history-content">
          {sortedHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Saved Selections</h3>
              <p>
                You haven't saved any team selections yet. Generate teams and save them
                to build your history.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {sortedHistory.map((selection) => (
                <div
                  key={selection.id}
                  className={`history-item ${expandedId === selection.id ? 'expanded' : ''}`}
                >
                  <div
                    className="history-item-header"
                    onClick={() => toggleExpand(selection.id)}
                  >
                    <div className="history-item-info">
                      <h3 className="selection-name" dir="auto">{selection.name}</h3>
                      <div className="selection-meta">
                        <span className="meta-date">📅 {formatDate(selection.date)}</span>
                        <span className="meta-teams">👥 {selection.teams.length} teams</span>
                        <span className="meta-players">⚽ {selection.activePlayerIds.length} players</span>
                      </div>
                      {selection.notes && (
                        <div className="selection-notes" dir="auto">
                          <span className="notes-icon">📝</span>
                          {selection.notes}
                        </div>
                      )}
                    </div>
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(selection.id);
                      }}
                    >
                      {expandedId === selection.id ? '▲' : '▼'}
                    </button>
                  </div>

                  {expandedId === selection.id && (
                    <div className="history-item-details">
                      <div className="teams-grid">
                        {selection.teams.map((team) => (
                          <div
                            key={team.id}
                            className="team-detail"
                            style={{
                              borderColor: team.color,
                              background: `linear-gradient(135deg, ${team.color}15, ${team.color}05)`
                            }}
                          >
                            <div className="team-detail-header">
                              <h4 className="team-name" style={{ color: team.color }}>
                                {team.name}
                              </h4>
                              <span className="team-rating">
                                ⭐ {team.averageRating.toFixed(1)}
                              </span>
                            </div>
                            <div className="team-players-list">
                              {team.players.map((player) => (
                                <div key={player.id} className="team-player">
                                  <span className="player-name" dir="auto">{player.name}</span>
                                  <div className="player-meta">
                                    <span className="player-position">{player.position}</span>
                                    <span className="player-rating">
                                      {player.rating}★
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="history-item-actions">
                        <button
                          className="load-button"
                          onClick={() => onLoad(selection)}
                          title="Load this selection to view"
                        >
                          📂 Load Selection
                        </button>

                        {deleteConfirmId === selection.id ? (
                          <div className="delete-confirm">
                            <span className="confirm-text">Delete this selection?</span>
                            <button
                              className="confirm-delete-button"
                              onClick={() => handleDelete(selection.id)}
                            >
                              Yes, Delete
                            </button>
                            <button
                              className="cancel-delete-button"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="delete-button"
                            onClick={() => setDeleteConfirmId(selection.id)}
                            title="Delete this selection"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {sortedHistory.length > 0 && (
          <div className="history-footer">
            <p className="history-count">
              Total: {sortedHistory.length} saved {sortedHistory.length === 1 ? 'selection' : 'selections'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelectionHistory;
