import { Player } from "./models/Player.js";
import { ServerLobbyContext } from "./models/ServerLobbyContext.js";
import { DefaultSettings } from "../shared/GameSettings.js";
import { GenerateID } from "./Utils.js";
import { ALL_GAMES } from "./GamesRegistry.js";

export class Lobby {
  constructor(io, lobbyId, settings = DefaultSettings) {
    this.context = new ServerLobbyContext(io, lobbyId);
    this.currentGame = null;
    this.phase = "lobby";
    this.settings = settings;
  }

  getPlayer(id) {
    if (!id) return undefined;
    return this.context.players.find((x) => x.id == id);
  }

  onNewPlayerConnection(socket, playerId, name, avatarSettings) {
    console.log(`Join: ${socket.id}, playerId: ${playerId}, name: ${name}`);
    let player = this.getPlayer(playerId);
    const isNewPlayer = player == undefined;

    if (isNewPlayer) {
      playerId = GenerateID(5);
      player = new Player(name, playerId, socket, avatarSettings);
    } else {
      player.socket = socket;
    }

    this.onPlayerJoined(player, isNewPlayer);
  }

  onPlayerJoined(player, isNewPlayer) {
    if (!isNewPlayer) {
      console.log(`${player.name} rejoined lobby '${this.context.lobbyId}'`);
      player.connected = false;
      player.disconnectedAt = null;
      clearTimeout(player.disconnectTimer);
    } else {
      console.log(`${player.name} joined lobby '${this.context.lobbyId}'`);
      this.context.players.push(player);
    }

    player.socket.join(this.context.lobbyId + "_PLAYERS");
    player.socket.on("results:fillGlass", (id) => this.onGlassFilled(id));
    player.socket.on("ready", (isReady) => {
      this.onPlayerReady(player.id, isReady);
    });

    player.socket.data.lobbyId = this.context.lobbyId;
    player.socket.data.playerId = player.id;

    player.socket.emit("lobby:joinResponse", {
      lobbyId: this.context.lobbyId,
      playerId: player.id,
    });

    this.broadcastLobbyState();
    if (this.phase == "game") {
      if (isNewPlayer) {
        this.currentGame?.onPlayerJoined(player);
      }
      this.currentGame?.registerListeners(player.socket);
    }
  }

  onPlayerJoined_old(socket, playerId, name, avatarSettings) {
    console.log(`Join: ${socket.id}, playerId: ${playerId}, name: ${name}`);
    let player = this.getPlayer(playerId);
    const isNewPlayer = player == undefined;

    if (!isNewPlayer) {
      console.log(`${player.name} rejoined lobby '${this.context.lobbyId}'`);
      player.connected = false;
      player.disconnectedAt = null;
      player.socket = socket;
      clearTimeout(player.disconnectTimer);
    } else {
      console.log(`${name} joined lobby '${this.context.lobbyId}'`);

      playerId = GenerateID(5);
      player = new Player(name, playerId, socket, avatarSettings);
      this.context.players.push(player);
    }

    socket.join(this.context.lobbyId + "_PLAYERS");
    socket.on("results:fillGlass", (id) => this.onGlassFilled(id));
    socket.on("ready", (isReady) => {
      this.onPlayerReady(playerId, isReady);
    });

    socket.data.lobbyId = this.context.lobbyId;
    socket.data.playerId = playerId;

    socket.emit("lobby:joinResponse", {
      lobbyId: this.context.lobbyId,
      playerId: playerId,
    });

    this.broadcastLobbyState();
    if (this.phase == "game") {
      if (isNewPlayer) {
        this.currentGame?.onPlayerJoined(player);
      }
      this.currentGame?.registerListeners(player.socket);
    }
  }

  onHostJoined(socket) {
    socket.join(this.context.lobbyId + "_HOST");
    socket.data.lobbyId = this.context.lobbyId;

    socket.on("lobby:start", () => this.start());
    socket.on("lobby:advancePhase", () => this.advancePhase());

    socket.emit("lobby:joinHostResponse", this.context.lobbyId);

    this.broadcastLobbyState();
    if (this.phase == "game") {
      this.currentGame?.onHostJoined(socket);
    }
  }

  onPlayerDisconnected(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.connected = false;
    player.disconnectedAt = Date.now();
    player.socket = null;

    player.disconnectTimer = setTimeout(() => {
      this.onPlayerLeft(playerId);
    }, 5000);
  }

  onPlayerLeft(playerId) {
    const playerIndex = this.context.players.findIndex((x) => x.id == playerId);
    if (playerIndex == -1) return;
    const playersToRemove = this.context.players.splice(playerIndex);

    if (playersToRemove.length != 0) {
      console.log(`${playersToRemove[0].name} left the lobby '${this.context.lobbyId}'`);
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
        this.startScoreboardScreen();
        break;
      case "scoreboard":
        this.startGameSelection();
        break;
    }
  }

  startGameSelection() {
    this.phase = "slot";
    this.broadcastLobbyState();

    setTimeout(() => this.startSpin(), 3000);

    setTimeout(() => this.advancePhase(), 10000);
  }

  startSpin() {
    const gameIndex = Math.floor(Math.random() * ALL_GAMES.length);

    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("startSpin", gameIndex);
    this.context.io.to(this.context.lobbyId + "_HOST").emit("startSpin", gameIndex);

    this.selectGame(gameIndex);
  }

  selectGame(gameIndex) {
    console.log(`Selecting game: ${gameIndex}`);
    this.gameIndex = gameIndex;
    this.currentGame = new ALL_GAMES[gameIndex]();
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

    //host joinar vid lobbyfasen, dvs innan gamefasen, o joinar inte vid minigamebyte
    //Host aktiv i roulette,så host socketen behöver listeners från onHostJoined()
    //inte bara i lobbyfasen
    for (let player of this.context.players) {
      this.currentGame?.onPlayerJoined(player);
      this.currentGame.registerListeners(player.socket);
    }

    this.context.io
      .in(this.context.lobbyId + "_HOST")
      .fetchSockets()
      .then((hostSockets) => {
        for (const s of hostSockets) {
          this.currentGame?.onHostJoined(s);
        }
      });

    this.currentGame.onFinished = (results) => this.finishGame(results);
    this.currentGame.start();
  }

  finishGame(results) {
    for (let res of results) {
      const player = this.context.players.find((x) => x.id == res.id);

      if (player) {
        console.log(`Giving ${res.score} points to ${player.name}. Previous score: ${player.score}`);
        player.score += res.score;
        console.log(`--> New Score for ${player.name}: ${player.score}`);
      } else {
        console.warn(`Could not find player with ID: ${res.id} (Might have disconnected)`);
      }
    }

    this.startResultScreen();
  }

  startScoreboardScreen() {
    this.phase = "scoreboard";
    this.broadcastLobbyState();
  }

  startResultScreen() {
    this.phase = "result";
    this.broadcastLobbyState();
  }

  onGlassFilled(id) {
    console.log("FILL GLASS OF PLAYER: " + id);
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

    if (this.context.players.filter((p) => p.isReady).length >= this.context.players.length / 2) {
      this.advancePhase();
    } else {
      this.broadcastLobbyState();
    }
  }

  broadcastLobbyState() {
    const state = {
      lobbyId: this.context.lobbyId,
      players: this.context.players.map(({ socket, ...rest }) => rest),
      settings: this.settings,
      phase: this.phase,
      gameIndex: this.gameIndex,
    };
    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("lobby:updateState", state);
    this.context.io.to(this.context.lobbyId + "_HOST").emit("lobby:updateState", state);
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
