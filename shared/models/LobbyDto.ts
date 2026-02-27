import type { PlayerDto } from "./PlayerDto.js";

export type LobbyDto = {
  id: string;
  phase: string;
  players: PlayerDto[];
  createdDate: number;
  disposalScheduled: boolean;
};
