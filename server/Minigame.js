export class Minigame {
  constructor() {
    this.context = undefined;
    this.onFinished = (results) => {};

    this.timeouts = [];
  }

  onPlayerJoined(player) {}
  onPlayerDisconnected(player) {}

  onHostJoined(socket) {}

  registerListeners(socket) {}
  unregisterListeners(socket) {}

  start() {}
  stop() {}

  setSafeTimeout(callback, delay) {
    const timeout = setTimeout(callback, delay);
    this.timeouts.push(timeout);
    return timeout;
  }

  clearTimeouts() {
    this.timeouts.forEach((t) => clearTimeout(t));
  }

  emitToPlayer(playerId, ev, ...args) {
    this.context.players.find((x) => x.id == playerId)?.socket.emit(ev, ...args);
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
