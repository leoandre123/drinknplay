import { reactive } from "vue";
import { socket } from "./socket";

export const context = reactive({
  isConnected: false,
  state: null,
  isHost: false,

  getCurrentPlayer() {
    return this.state?.players.find((p) => p.id == socket.id);
  },
});
