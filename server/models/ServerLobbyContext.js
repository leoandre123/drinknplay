export class ServerLobbyContext {
  constructor(io, lobbyId) {
    this.io = io;
    this.lobbyId = lobbyId;
    this.players = [];
  }
}
