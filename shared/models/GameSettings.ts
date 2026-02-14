export type GameSettings = {
  numberOfRounds: number;
  drunknessLevel: number;
  maxPlayers: number;
  doEvents: boolean;
  selectedMinigames: number[];
};

export const DefaultSettings: GameSettings = {
  numberOfRounds: 10,
  drunknessLevel: 2,
  maxPlayers: 6,
  doEvents: true,
  selectedMinigames: [0, 1, 2, 3, 4, 5, 6],
};
