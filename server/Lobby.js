import { Player } from "./models/Player.js";
import { ServerLobbyContext } from "./models/ServerLobbyContext.js";
import { RacingGame } from "./minigames/RacingGame.js";
import { KahootGame } from "./minigames/KahootGame.js";
import { DrawingGame } from "./minigames/drawingGame.js";
import { ReactionGame } from "./minigames/ReactionGame.js";

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

    socket.on("fillGlassIndex", (id) => this.onGlassFilled(id));
    socket.on("ready", (isReady) => {
      this.onPlayerReady(socket.id, isReady);
    });

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
    const playerIndex = this.context.players.findIndex((x) => x.id == playerId);
    if (playerIndex == -1) return;
    const playersToRemove = this.context.players.splice(playerIndex);
    console.log(`${playersToRemove.name} left the lobby '${this.context.lobbyId}'`);
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
    this.broadcastLobbyState();

    setTimeout(() => this.startSpin(), 5000);

    setTimeout(() => this.advancePhase(), 15000);
  }

  startSpin() {
    const gameIndex = Math.floor(Math.random() * 4);

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
      case 2:
        this.currentGame = new DrawingGame();
        break;
      case 3:
        this.currentGame = new ReactionGame();
        break;
    }
  }

  startLoadingScreen() {
    this.context.players.forEach((p) => (p.isReady = false));
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

    this.currentGame.onFinished = (results) => this.finishGame(results);
    this.currentGame.start();
  }

  finishGame(results) {
    for (let res of results) {
      this.context.players.find((x) => x.id == res.id).score += res.score;
    }

    this.startResultScreen();
  }

  startResultScreen() {
    console.log("Entering result phase");
    this.phase = "result";
    this.broadcastLobbyState();
  }

  onGlassFilled(id) {
    const player = this.context.players.find((x) => x.id == id);
    player.glassFillLevel += 0.2; //TODO: Based on setting

    while (player.glassFillLevel >= 1) {
      player.drunkness++;
      player.glassFillLevel--;
    }

    this.broadcastLobbyState();
  }

  onPlayerReady(id, isReady) {
    if (this.phase != "loading") return;
    const player = this.context.players.find((x) => x.id == id);
    player.isReady = isReady;

    if (this.context.players.filter((p) => p.isReady).length > this.context.players.length / 2) {
      this.advancePhase();
    }
  }

  broadcastLobbyState() {
    const state = {
      lobbyId: this.context.lobbyId,
      players: this.context.players.map(({ socket, ...rest }) => rest),
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
