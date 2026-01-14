export type GameSettings = {
  numberOfRounds: number;
  drunknessLevel: number;
  maxPlayers: number;
  doEvents: boolean;
};

export const DefaultSettings: GameSettings = {
  numberOfRounds: 10,
  drunknessLevel: 2,
  maxPlayers: 6,
  doEvents: true,
};
