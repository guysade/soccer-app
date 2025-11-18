import { Player, Team, TeamGenerationOptions, TeamConstraint, TeamColor, TeamSelection } from '../types';

interface PlayerWithWeight extends Player {
  weight: number;
}

interface PlayerPairingHistory {
  [playerPair: string]: number; // e.g., "player1-player2": count
}

export class TeamGenerator {
  private static generateTeamId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static buildPlayerPairingHistory(previousSelections: TeamSelection[], limit: number = 5): PlayerPairingHistory {
    const pairingHistory: PlayerPairingHistory = {};

    // Consider only the most recent selections (configurable, default is 5)
    const recentSelections = previousSelections.slice(-limit);

    for (const selection of recentSelections) {
      for (const team of selection.teams) {
        const playerIds = team.players.map(p => p.id);

        // Record all pairings within this team
        for (let i = 0; i < playerIds.length; i++) {
          for (let j = i + 1; j < playerIds.length; j++) {
            const pair = this.createPairKey(playerIds[i], playerIds[j]);
            pairingHistory[pair] = (pairingHistory[pair] || 0) + 1;
          }
        }
      }
    }

    return pairingHistory;
  }

  private static createPairKey(playerId1: string, playerId2: string): string {
    // Always create a consistent key regardless of order
    return playerId1 < playerId2 ? `${playerId1}-${playerId2}` : `${playerId2}-${playerId1}`;
  }

  private static getPairingCount(playerId1: string, playerId2: string, pairingHistory: PlayerPairingHistory): number {
    const pairKey = this.createPairKey(playerId1, playerId2);
    return pairingHistory[pairKey] || 0;
  }

  private static calculatePlayerWeight(player: Player, allPlayers: Player[]): number {
    const ratingWeight = player.rating * 2;
    const positionWeight = this.getPositionWeight(player.position);
    const conflictWeight = player.conflicts.length * 0.5;
    
    return ratingWeight + positionWeight - conflictWeight;
  }

  private static getPositionWeight(position: string): number {
    switch (position) {
      case 'GK': return 10; // Goalkeepers are crucial
      case 'DEF': return 6;
      case 'MID': return 8;
      case 'FWD': return 7;
      default: return 5;
    }
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static canPlayTogether(player1: Player, player2: Player): boolean {
    return !player1.conflicts.includes(player2.id) && !player2.conflicts.includes(player1.id);
  }

  private static canAddPlayerToTeam(player: Player, team: Player[], constraints?: TeamConstraint[], teamIndex?: number): boolean {
    // Check individual player conflicts
    if (!team.every(teammate => this.canPlayTogether(player, teammate))) {
      return false;
    }

    // Check team constraints if provided
    if (constraints) {
      const activeConstraints = constraints.filter(c => c.active);
      
      for (const constraint of activeConstraints) {
        if (!constraint.playerIds.includes(player.id)) continue;

        const otherPlayersInConstraint = constraint.playerIds.filter(id => id !== player.id);
        const teamPlayerIds = team.map(p => p.id);

        switch (constraint.type) {
          case 'cannot_play_together':
            // If any other player from this constraint is already in the team, player cannot be added
            if (otherPlayersInConstraint.some(id => teamPlayerIds.includes(id))) {
              return false;
            }
            break;

          case 'must_play_together':
            // For "must play together", we allow adding if it helps keep the group together
            // This logic could be enhanced based on specific requirements
            break;

          case 'separate_teams':
            // Similar to cannot_play_together
            if (otherPlayersInConstraint.some(id => teamPlayerIds.includes(id))) {
              return false;
            }
            break;

          case 'cannot_wear_color':
            // Check if this team's color is restricted for this player
            if (teamIndex !== undefined && constraint.restrictedColors) {
              const teamColors: TeamColor[] = ['white', 'colored', 'black'];
              const teamColor = teamColors[teamIndex % teamColors.length];
              if (constraint.restrictedColors.includes(teamColor)) {
                return false;
              }
            }
            break;
        }
      }
    }

    return true;
  }

  private static calculateTeamBalance(teams: Player[][]): number {
    const teamRatings = teams.map(team => 
      team.reduce((sum, player) => sum + player.rating, 0) / Math.max(team.length, 1)
    );
    
    const avgRating = teamRatings.reduce((sum, rating) => sum + rating, 0) / teamRatings.length;
    const variance = teamRatings.reduce((sum, rating) => sum + Math.pow(rating - avgRating, 2), 0) / teamRatings.length;
    
    return Math.sqrt(variance);
  }

  private static getPositionDistribution(team: Player[]): { [key: string]: number } {
    const distribution = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    team.forEach(player => {
      distribution[player.position]++;
    });
    return distribution;
  }

  private static calculatePositionBalance(teams: Player[][]): number {
    let totalImbalance = 0;

    teams.forEach(team => {
      const distribution = this.getPositionDistribution(team);
      const positions = Object.values(distribution);
      const maxPos = Math.max(...positions);
      const minPos = Math.min(...positions);
      totalImbalance += maxPos - minPos;
    });

    return totalImbalance;
  }

  private static calculatePairingPenalty(teams: Player[][], pairingHistory: PlayerPairingHistory): number {
    let totalPenalty = 0;

    for (const team of teams) {
      const playerIds = team.map(p => p.id);

      // Calculate penalty for all pairings in this team
      for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
          const pairingCount = this.getPairingCount(playerIds[i], playerIds[j], pairingHistory);
          // Higher penalty for more frequent pairings
          totalPenalty += pairingCount * pairingCount; // Quadratic penalty
        }
      }
    }

    return totalPenalty;
  }

  public static generateBalancedTeams(
    allPlayers: Player[],
    options: TeamGenerationOptions
  ): Team[] {
    const { activePlayerIds, teamSize = 6, teamConstraints, previousSelections, diversifyPairings = true } = options;

    // Filter active players
    const activePlayers = allPlayers.filter(player =>
      activePlayerIds.includes(player.id) && player.active
    );

    if (activePlayers.length < 2) {
      return [];
    }

    // Calculate number of teams
    const numTeams = Math.max(2, Math.ceil(activePlayers.length / teamSize));

    // Build pairing history if diversification is enabled
    const pairingHistory = (diversifyPairings && previousSelections && previousSelections.length > 0)
      ? this.buildPlayerPairingHistory(previousSelections)
      : {};

    // Try multiple generation attempts and pick the best one
    let bestTeams: Player[][] = [];
    let bestScore = Infinity;

    for (let attempt = 0; attempt < 50; attempt++) {
      const teamsAttempt = this.generateTeamsAttempt(activePlayers, numTeams, teamConstraints, pairingHistory);
      const ratingBalance = this.calculateTeamBalance(teamsAttempt);
      const positionBalance = this.calculatePositionBalance(teamsAttempt);
      const pairingPenalty = diversifyPairings ? this.calculatePairingPenalty(teamsAttempt, pairingHistory) : 0;
      const score = ratingBalance * 2 + positionBalance + pairingPenalty * 0.5;

      if (score < bestScore) {
        bestScore = score;
        bestTeams = teamsAttempt;
      }
    }

    // Convert to Team objects
    const teamColors = ['#FFFFFF', '#4CAF50', '#000000']; // White, Colored (Green), Black
    const teamNames = ['White Team', 'Colored Team', 'Black Team'];
    const teamBorderColors = ['#E0E0E0', '#4CAF50', '#000000']; // Border colors for better visibility
    
    const teamColorTypes: TeamColor[] = ['white', 'colored', 'black'];
    
    return bestTeams.map((teamPlayers, index) => ({
      id: this.generateTeamId(),
      name: teamNames[index] || `Team ${index + 1}`,
      players: teamPlayers,
      averageRating: teamPlayers.length > 0
        ? Math.round((teamPlayers.reduce((sum, player) => sum + player.rating, 0) / teamPlayers.length) * 100) / 100
        : 0,
      color: teamColors[index] || '#2E7D32',
      borderColor: teamBorderColors[index] || '#2E7D32',
      teamColor: teamColorTypes[index] || 'colored'
    }));
  }

  private static generateTeamsAttempt(players: Player[], numTeams: number, constraints?: TeamConstraint[], pairingHistory?: PlayerPairingHistory): Player[][] {
    // Initialize empty teams
    const teams: Player[][] = Array(numTeams).fill(null).map(() => []);
    
    // Add weighted randomization to player selection
    const playersWithWeights: PlayerWithWeight[] = players.map(player => ({
      ...player,
      weight: this.calculatePlayerWeight(player, players)
    }));
    
    // Sort players by weight (highest first) with some randomization
    const shuffledPlayers = this.shuffleArray(playersWithWeights)
      .sort((a, b) => {
        // Add some randomness while generally preferring higher weights
        const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
        return (b.weight - a.weight) + randomFactor;
      });

    // Distribute players using snake draft approach
    for (let i = 0; i < shuffledPlayers.length; i++) {
      const player = shuffledPlayers[i];
      let bestTeamIndex = 0;
      let bestScore = -Infinity;

      for (let teamIndex = 0; teamIndex < numTeams; teamIndex++) {
        const team = teams[teamIndex];

        // Check if player can be added to this team (no conflicts)
        if (!this.canAddPlayerToTeam(player, team, constraints, teamIndex)) {
          continue;
        }

        // Calculate score for adding player to this team
        let score = 0;

        // Prefer smaller teams
        score += (numTeams - team.length) * 5;

        // Prefer teams lacking this position
        const positionDistribution = this.getPositionDistribution(team);
        if (positionDistribution[player.position] === 0) {
          score += 10;
        } else {
          score -= positionDistribution[player.position] * 3;
        }

        // Prefer teams with lower average rating
        const teamRating = team.length > 0
          ? team.reduce((sum, p) => sum + p.rating, 0) / team.length
          : 0;
        score += (5 - teamRating) * 2;

        // Penalize teams where this player has frequently played with existing teammates
        if (pairingHistory && Object.keys(pairingHistory).length > 0) {
          let pairingPenalty = 0;
          for (const teammate of team) {
            const pairingCount = this.getPairingCount(player.id, teammate.id, pairingHistory);
            pairingPenalty += pairingCount * 3; // Penalize frequent pairings
          }
          score -= pairingPenalty;
        }

        if (score > bestScore) {
          bestScore = score;
          bestTeamIndex = teamIndex;
        }
      }

      teams[bestTeamIndex].push(player);
    }

    return teams;
  }

  public static redistributePlayer(
    teams: Team[],
    playerId: string,
    targetTeamId: string,
    allPlayers: Player[]
  ): Team[] {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return teams;

    return teams.map(team => {
      if (team.id === targetTeamId) {
        // Add player to target team if no conflicts
        const canAdd = this.canAddPlayerToTeam(player, team.players);
        if (canAdd) {
          const newPlayers = [...team.players, player];
          return {
            ...team,
            players: newPlayers,
            averageRating: Math.round((newPlayers.reduce((sum, p) => sum + p.rating, 0) / newPlayers.length) * 100) / 100
          };
        }
        return team;
      } else {
        // Remove player from other teams
        const newPlayers = team.players.filter(p => p.id !== playerId);
        return {
          ...team,
          players: newPlayers,
          averageRating: newPlayers.length > 0
            ? Math.round((newPlayers.reduce((sum, p) => sum + p.rating, 0) / newPlayers.length) * 100) / 100
            : 0
        };
      }
    });
  }
}