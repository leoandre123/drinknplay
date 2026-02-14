import { reactive } from "vue";

export const context = reactive<{
  isConnected: boolean;
  state: any;
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
