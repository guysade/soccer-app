import React, { useState, useEffect } from 'react';
import { Player } from '../../types';
import { StorageManager } from '../../utils/storage';
import PlayerCard from '../../components/PlayerCard';
import PlayerForm from '../../components/PlayerForm';
import './PlayerManagement.css';

const PlayerManagement: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    const data = StorageManager.loadData();
    setPlayers(data.players);
  };

  const generatePlayerId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSavePlayer = (playerData: Omit<Player, 'id'> & { id?: string }) => {
    const updatedPlayers = [...players];
    
    if (playerData.id) {
      // Edit existing player
      const index = updatedPlayers.findIndex(p => p.id === playerData.id);
      if (index !== -1) {
        updatedPlayers[index] = playerData as Player;
      }
    } else {
      // Add new player
      const newPlayer: Player = {
        ...playerData,
        id: generatePlayerId()
      };
      updatedPlayers.push(newPlayer);
    }
    
    setPlayers(updatedPlayers);
    StorageManager.savePlayers(updatedPlayers);
    setShowForm(false);
    setEditingPlayer(undefined);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      const updatedPlayers = players.filter(p => p.id !== playerId);
      setPlayers(updatedPlayers);
      StorageManager.savePlayers(updatedPlayers);
    }
  };

  const handleToggleActive = (playerId: string) => {
    const updatedPlayers = players.map(player =>
      player.id === playerId ? { ...player, active: !player.active } : player
    );
    setPlayers(updatedPlayers);
    StorageManager.savePlayers(updatedPlayers);
  };

  const handleRatingChange = (playerId: string, rating: number) => {
    const updatedPlayers = players.map(player =>
      player.id === playerId ? { ...player, rating } : player
    );
    setPlayers(updatedPlayers);
    StorageManager.savePlayers(updatedPlayers);
  };

  const handleAddNewPlayer = () => {
    setEditingPlayer(undefined);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlayer(undefined);
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && player.active) ||
      (filterStatus === 'inactive' && !player.active);
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getPlayerStats = () => {
    const total = players.length;
    const active = players.filter(p => p.active).length;
    const positions = {
      GK: players.filter(p => p.position === 'GK').length,
      DEF: players.filter(p => p.position === 'DEF').length,
      MID: players.filter(p => p.position === 'MID').length,
      FWD: players.filter(p => p.position === 'FWD').length
    };
    const avgRating = total > 0 
      ? (players.reduce((sum, p) => sum + p.rating, 0) / total).toFixed(1)
      : '0.0';

    return { total, active, positions, avgRating };
  };

  const stats = getPlayerStats();

  return (
    <div className="player-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Player Management</h1>
          <p>Manage your soccer players and their information</p>
        </div>
        <button className="add-player-button" onClick={handleAddNewPlayer}>
          <span className="button-icon">⚽</span>
          Add New Player
        </button>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Players</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
        <div className="stat-card positions-card">
          <div className="positions-breakdown">
            <div className="position-stat">🥅 {stats.positions.GK}</div>
            <div className="position-stat">🛡️ {stats.positions.DEF}</div>
            <div className="position-stat">⚽ {stats.positions.MID}</div>
            <div className="position-stat">🎯 {stats.positions.FWD}</div>
          </div>
          <div className="stat-label">Positions</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select 
            value={filterPosition} 
            onChange={(e) => setFilterPosition(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Positions</option>
            <option value="GK">🥅 Goalkeeper</option>
            <option value="DEF">🛡️ Defender</option>
            <option value="MID">⚽ Midfielder</option>
            <option value="FWD">🎯 Forward</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Players</option>
            <option value="active">✅ Available</option>
            <option value="inactive">❌ Unavailable</option>
          </select>
        </div>
      </div>

      <div className="players-section">
        {filteredPlayers.length > 0 ? (
          <div className="players-grid">
            {filteredPlayers.map(player => (
              <div key={player.id} className="player-card-container">
                <PlayerCard
                  player={player}
                  onEdit={handleEditPlayer}
                  onToggleActive={handleToggleActive}
                  onRatingChange={handleRatingChange}
                  showActions={true}
                />
                <button 
                  className="delete-button"
                  onClick={() => handleDeletePlayer(player.id)}
                  title="Delete player"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No players found</h3>
            <p>
              {players.length === 0 
                ? "Get started by adding your first player!"
                : "Try adjusting your search or filters."
              }
            </p>
            {players.length === 0 && (
              <button className="empty-action-button" onClick={handleAddNewPlayer}>
                Add Your First Player
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <PlayerForm
          player={editingPlayer}
          allPlayers={players}
          onSave={handleSavePlayer}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default PlayerManagement;