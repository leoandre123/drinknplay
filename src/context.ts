import { reactive } from "vue";
import type { LobbyStateDto } from "@shared/models/LobbyStateDto.js";

export const context = reactive<{
  isConnected: boolean;
  state: LobbyStateDto | null;
  isHost: boolean;
  lobbyId: string;
  playerId: string;

  getCurrentPlayer: () => any;
}>({
  isConnected: false,
  state: null,
  isHost: false,
  lobbyId: "",
  playerId: "",

  getCurrentPlayer() {
    return this.state?.players.find((p: any) => p.id == this.playerId);
  },
});
