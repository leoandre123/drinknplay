export type Bet = {
  amount: number;
  type: string;
  value: any;
};

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
  betsByPlayer: Map<string, Bet[]>;
  spinResult: SpinResult;
  round: number;
  maxRounds: number;
  totalPerPlayer: Map<string, number>;
};
export type RouletteStateDto = {
  phase: string;
  betsByPlayer: [string, Bet[]][];
  spinResult: SpinResult;
  round: number;
  maxRounds: number;
  totalPerPlayer: [string, number][];
};

export namespace RouletteState {
  export function toDto(state: RouletteState): RouletteStateDto {
    return {
      phase: state.phase,
      betsByPlayer: Array.from(state.betsByPlayer.entries()),
      spinResult: state.spinResult,
      round: state.round,
      maxRounds: state.maxRounds,
      totalPerPlayer: Array.from(state.totalPerPlayer.entries()),
    };
  }
  export function toState(state: RouletteStateDto): RouletteState {
    return {
      phase: state.phase,
      betsByPlayer: new Map(state.betsByPlayer),
      spinResult: state.spinResult,
      round: state.round,
      maxRounds: state.maxRounds,
      totalPerPlayer: new Map(state.totalPerPlayer),
    };
  }
}
