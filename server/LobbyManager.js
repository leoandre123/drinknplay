import { Lobby } from "./Lobby.js";
import { RacingGame } from "./minigames/RacingGame.js";
import { GenerateID } from "./Utils.js";

export class LobbyManager {
  constructor(io) {
    this.io = io;

    const raceLobby = new Lobby(io, "race");
    raceLobby.currentGame = new RacingGame(true);
    raceLobby.gameIndex = 0;
    raceLobby.startMinigame();

    const kahootLobby = new Lobby(io, "kahoot");
    kahootLobby.selectGame(1);
    kahootLobby.startMinigame();

    const drawLobby = new Lobby(io, "draw");
    drawLobby.selectGame(2);
    drawLobby.startMinigame();

    const resultLobby = new Lobby(io, "result");
    resultLobby.startResultScreen();

    const lobby = new Lobby(io, "lobby");

    this.lobbies = [lobby, raceLobby, kahootLobby, resultLobby, drawLobby];
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
