import type { PlayerDto } from "./PlayerDto.js";
import type { GameSettings } from "./GameSettings.js";

export type LobbyStateDto = {
  lobbyId: string;
  players: PlayerDto[];
  settings: GameSettings;
  phase: string;
  gameIndex: number;
};
