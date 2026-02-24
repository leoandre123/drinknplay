export type SpinResult = {
  result: number;
  color: string;
  winners: {
    playerId: string;
    name: any;
    winningAmount: any;
  }[];
};
export type RouletteState = {
  phase: string;
  betsByPlayer: object[];
  spinResult: SpinResult;
  round: number;
  maxRounds: number;
  totalPerPlayer: { [k: string]: number };
};
