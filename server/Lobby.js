import { Player } from "./models/Player.js";
import { ServerLobbyContext } from "./models/ServerLobbyContext.js";
import { RacingGame } from "./minigames/RacingGame.js";
import { KahootGame } from "./minigames/KahootGame.js";

export class Lobby {
  constructor(io, lobbyId) {
    this.context = new ServerLobbyContext(io, lobbyId);
    this.currentGame = null;
    this.phase = "lobby";
  }

  onPlayerJoined(socket, name) {
    console.log(`${name} joined lobby '${this.context.lobbyId}'`);
    socket.join(this.context.lobbyId + "_PLAYERS");
    socket.data.lobbyId = this.context.lobbyId;
    socket.emit("joinLobbyResponse", this.context.lobbyId);

    const player = new Player(name, socket.id, socket);

    this.context.players.push(player);
    this.broadcastLobbyState();
    if (this.phase == "game") {
      this.currentGame?.onPlayerJoined(player);
      this.currentGame?.registerListeners(player.socket);
    }
  }

  onHostJoined(socket) {
    socket.join(this.context.lobbyId + "_HOST");
    socket.data.lobbyId = this.context.lobbyId;

    socket.on("startGame", () => this.start());
    socket.on("advancePhase", () => this.advancePhase());

    socket.on("startSpin", () => this.startSpin());

    socket.emit("joinLobbyHostResponse", this.context.lobbyId);
    this.broadcastLobbyState();
  }

  onPlayerDisconnected(playerId) {
    const playersToRemove = this.context.players.splice(
      this.context.players.findIndex((x) => x.id != playerId)
    );
    if (playersToRemove.length != 0) {
      this.broadcastLobbyState();
      if (this.phase == "game") {
        this.currentGame?.onPlayerDisconnected(playersToRemove[0]);
        if (playersToRemove[0].socket)
          this.currentGame?.unregisterListeners(playersToRemove[0].socket);
      }
    }
  }

  start() {
    this.startRound();
  }

  startRound() {
    this.startGameSelection();
  }

  advancePhase() {
    switch (this.phase) {
      case "slot":
        this.startLoadingScreen();
        break;
      case "loading":
        this.startMinigame();
        break;
      case "game":
        this.currentGame?.stop();
        this.startResultScreen();
        break;
      case "result":
        this.startGameSelection();
        break;
    }
  }

  startGameSelection() {
    this.phase = "slot";
    const gameIndex = 0; /* Select random minigame */
    this.broadcastLobbyState();
  }

  startSpin() {
    const gameIndex = Math.floor(Math.random() * 2);

    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("startSpin", gameIndex);
    this.context.io.to(this.context.lobbyId + "_HOST").emit("startSpin", gameIndex);

    this.selectGame(gameIndex);
  }

  selectGame(gameIndex) {
    console.log(`Selecting game: ${gameIndex}`);
    this.gameIndex = gameIndex;
    switch (gameIndex) {
      case 0:
        this.currentGame = new RacingGame();
        break;
      case 1:
        this.currentGame = new KahootGame();
        break;
    }
  }

  startLoadingScreen() {
    this.phase = "loading";
    this.broadcastLobbyState();
  }

  startMinigame() {
    this.phase = "game";
    this.broadcastLobbyState();

    this.currentGame.context = this.context;
    for (let player of this.context.players) {
      this.currentGame?.onPlayerJoined(player);
      this.currentGame.registerListeners(player.socket);
    }

    this.currentGame.onFinished = () => this.startResultScreen();
    this.currentGame.start();
  }

  startResultScreen() {
    console.log("Entering result phase");
    this.phase = "result";
    this.broadcastLobbyState();
  }

  broadcastLobbyState() {
    const state = {
      lobbyId: this.context.lobbyId,
      players: this.context.players.map((x) => {
        return {
          name: x.name,
        };
      }),
      phase: this.phase,
      gameIndex: this.gameIndex,
    };
    console.log(`Broadcasting state`);
    console.log(state);
    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("updateLobbyState", state);
    this.context.io.to(this.context.lobbyId + "_HOST").emit("updateLobbyState", state);
  }

  /*
   * Lobby/Settings view
   *
   * ->  Run slot machine (select minigame)
   * |   Show loading screen (with tips about the following minigame)
   * |   Start minigame
   * |   Wait for minigame to finish
   * |   Show result
   * |_______|
   */
}
