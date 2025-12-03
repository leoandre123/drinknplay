export class Minigame {
  constructor() {
    this.context = undefined;
    this.onFinished = () => {};
  }

  onPlayerJoined(player) {}
  onPlayerDisconnected(player) {}

  registerListeners(socket) {}
  unregisterListeners(socket) {}

  start() {}
  stop() {}

  emitToPlayer(playerId, ev, ...args) {
    this.context.players
      .find((x) => x.id == playerId)
      ?.socket.emit(ev, ...args);
  }

  broadcast(ev, ...args) {
    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit(ev, ...args);
    this.context.io.to(this.context.lobbyId + "_HOST").emit(ev, ...args);
  }

  broadcastHosts(ev, ...args) {
    this.context.io.to(this.context.lobbyId + "_HOST").emit(ev, ...args);
  }

  broadcastPlayers(ev, ...args) {
    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit(ev, ...args);
  }
}
