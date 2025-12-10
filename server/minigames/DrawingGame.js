import { Minigame } from "../Minigame.js";

export class DrawingGame extends Minigame {
    constructor() {
        super();
        this.drawingPlayers = [];

    }

    onPlayerJoined(player) {

    }
    onPlayerDisconnected(player) {

    }

    registerListeners(socket) {
        socket.on("updateCanvas", (canvasData) => {
            this.broadcastHosts("updateCanvas", canvasData, socket.id);
        });
    }
    unregisterListeners(socket) {
        socket?.removeAllListeners("updateCanvas");
    }

    start() { }
    stop() { }
}
