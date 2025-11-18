export interface Player {
  id: string;
  name: string;
  rating: number; // 1-5 (supports 0.5 increments)
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  conflicts: string[]; // Array of player IDs who cannot be on same team
  active: boolean; // Whether player is available this week
}

export type TeamColor = 'white' | 'colored' | 'black';

export interface Team {
  id: string;
  name: string;
  players: Player[];
  averageRating: number;
  color: string;
  borderColor?: string;
  teamColor: TeamColor;
}

export interface TeamConstraint {
  id: string;
  name: string;
  type: 'cannot_play_together' | 'must_play_together' | 'separate_teams' | 'cannot_wear_color';
  playerIds: string[];
  restrictedColors?: TeamColor[]; // For color constraints
  description?: string;
  active: boolean;
}

export interface TeamSelection {
  id: string;
  date: string;
  name: string; // User-given name like "Game 1 - Sept 15"
  teams: Team[];
  activePlayerIds: string[];
  notes?: string;
  saved: boolean; // Only saved selections appear in history
}

export interface AppData {
  players: Player[];
  constraints: TeamConstraint[];
  settings: {
    defaultTeamSize: number;
    teamNames: string[];
  };
  lastGenerated: {
    date: string;
    teams: Team[];
    activePlayerIds: string[];
  } | null;
  teamSelectionHistory: TeamSelection[]; // History of saved team selections
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface TeamGenerationOptions {
  activePlayerIds: string[];
  teamSize?: number;
  respectConstraints?: boolean;
  teamConstraints?: TeamConstraint[];
  previousSelections?: TeamSelection[]; // For diversifying team generation
  diversifyPairings?: boolean; // Whether to avoid recent pairings
}