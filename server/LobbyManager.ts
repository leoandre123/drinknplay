import type { Server } from "socket.io";
import { Lobby } from "./Lobby.js";
import { GenerateID } from "./Utils.js";
import type { GameSettings } from "@shared/models/GameSettings.js";

export class LobbyManager {
  io: Server;
  lobbies: Lobby[];

  constructor(io: Server) {
    this.io = io;

    const resultLobby = new Lobby(io, "result");
    resultLobby.startResultScreen();

    const endResult = new Lobby(io, "final");
    endResult.startFinalResultScreen();

    const lobby = new Lobby(io, "lobby");
    const leo = new Lobby(io, "LEO");

    this.lobbies = [lobby, resultLobby, endResult, leo];

    this.#addDebugLobby("race", 0);
    this.#addDebugLobby("kahoot", 1);
    this.#addDebugLobby("draw", 2);
    this.#addDebugLobby("reaction", 3);
    this.#addDebugLobby("closest", 4);
    this.#addDebugLobby("maze", 5);
    this.#addDebugLobby("roulette", 6);
  }

  #addDebugLobby(id: string, gameIndex: number) {
    const lobby = new Lobby(this.io, id);
    lobby.selectGame(gameIndex);
    lobby.startLoadingScreen();
    this.lobbies.push(lobby);
  }

  createLobby(gameSettings: GameSettings) {
    let id: string;
    do {
      id = GenerateID(3);
    } while (this.lobbies.some((x) => x.context.lobbyId == id));
    const lobby = new Lobby(this.io, id, gameSettings);
    this.lobbies.push(lobby);
    return id;
  }

  getLobby(lobbyId: string) {
    return this.lobbies.find((x) => x.context.lobbyId == lobbyId);
  }
}
