import { reactive } from "vue";
import { socket } from "./socket";

export const context = reactive({
  isConnected: false,
  state: null,
  isHost: false,
  lobbyId: "",
  playerId: "",

  getCurrentPlayer() {
    return this.state?.players.find((p) => p.id == this.playerId);
  },
});
