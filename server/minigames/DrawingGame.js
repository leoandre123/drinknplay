import { Minigame } from "../Minigame.js";

export class DrawingGame extends Minigame {
  constructor() {
    super();
    this.drawingPlayers = [];
  }

  onPlayerJoined(player) {}
  onPlayerDisconnected(player) {}

  registerListeners(socket) {
    socket.on("updateCanvas", (canvasData) => {
      this.broadcastHosts("updateCanvas", canvasData, socket.data.playerId);
    });
  }
  unregisterListeners(socket) {
    socket?.removeAllListeners("updateCanvas");
  }

  start() {}
  stop() {}
}
