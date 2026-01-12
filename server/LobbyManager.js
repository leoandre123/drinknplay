import { Lobby } from "./Lobby.js";
import { RacingGame } from "./minigames/RacingGame.js";
import { GenerateID } from "./Utils.js";

export class LobbyManager {
  constructor(io) {
    this.io = io;

    const resultLobby = new Lobby(io, "result");
    resultLobby.startResultScreen();

    const lobby = new Lobby(io, "lobby");

    this.lobbies = [lobby, resultLobby];

    this.#addDebugLobby("race", 0);
    this.#addDebugLobby("kahoot", 1);
    this.#addDebugLobby("draw", 2);
    this.#addDebugLobby("reaction", 3);
    this.#addDebugLobby("closest", 4);
    this.#addDebugLobby("maze", 5);
    this.#addDebugLobby("roulette", 6);
  }

  #addDebugLobby(id, gameIndex) {
    const lobby = new Lobby(this.io, id);
    lobby.selectGame(gameIndex);
    lobby.startLoadingScreen();
    this.lobbies.push(lobby);
  }

  createLobby(gameSettings) {
    let id;
    do {
      id = GenerateID(3);
    } while (this.lobbies.some((x) => x.context.lobbyId == id));
    const lobby = new Lobby(this.io, id, gameSettings);
    this.lobbies.push(lobby);
    return id;
  }

  getLobby(lobbyId) {
    return this.lobbies.find((x) => x.context.lobbyId == lobbyId);
  }
}
