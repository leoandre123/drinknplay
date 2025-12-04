import { Lobby } from "./Lobby.js";
import { RacingGame } from "./minigames/RacingGame.js";
import { KahootGame } from "./minigames/KahootGame.js";

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

    const resultLobby = new Lobby(io, "result");
    resultLobby.startResultScreen();

    const lobby = new Lobby(io, "lobby");

    this.lobbies = [lobby, raceLobby, kahootLobby, resultLobby];
  }

  createLobby() {
    const id = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    //TODO: Check for collisions
    const lobby = new Lobby(this.io, id);

    this.lobbies.push(lobby);
  }

  getLobby(lobbyId) {
    return this.lobbies.find((x) => x.context.lobbyId == lobbyId);
  }
}
