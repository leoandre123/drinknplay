import { Player } from "./models/Player.js";
import { ServerLobbyContext } from "./models/ServerLobbyContext.js";
import { DefaultSettings } from "../shared/GameSettings.js";
import { GenerateID, sleep } from "./Utils.js";
import { ALL_GAMES } from "./GamesRegistry.js";
import { Logger } from "./logger.js";

export class Lobby {
  constructor(io, lobbyId, settings = DefaultSettings) {
    this.context = new ServerLobbyContext(io, lobbyId);
    this.currentGame = null;
    this.phase = "lobby";
    this.settings = settings;

    this.givenCredits = new Map();
    this.gameScores = new Map();
    this.drinksToDrink = new Map();

    this.logger = new Logger(`LOBBY: ${lobbyId}`);
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
      player.connected = true;
      player.disconnectedAt = null;
      clearTimeout(player.disconnectTimer);
    } else {
      console.log(`${player.name} joined lobby '${this.context.lobbyId}'`);
      this.context.players.push(player);
    }

    player.socket.join(this.context.lobbyId + "_PLAYERS");
    player.socket.on("results:confirmCredits", (credits) =>
      this.onCreditsReceived(player.id, credits)
    );
    player.socket.on("scoredboard:confirmDrink", () => this.onDrinkConfirmed(player.id));
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
    const playersToRemove = this.context.players.splice(playerIndex, 1);

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
    this.logger.debug(`Selecting game: ${gameIndex}`);
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
    this.logger.info("Game Finished!");
    this.logger.debug(results);
    this.context.players.forEach((p) => {
      p.isReady = false;
      p.gameScore = 0;
    });
    this.givenCredits.clear();
    this.drinksToDrink.clear();
    this.gameScores.clear();

    if (results?.type == "credits") {
      for (let res of results.data) {
        const player = this.getPlayer(res.playerId);
        player.credits = res.credits;
      }
    } else if (results?.type == "scores") {
      const creditsPerGame = 10;

      for (let res of results.data) {
        this.gameScores.set(res.playerId, res.score);
        const player = this.getPlayer(res.playerId);
        player.gameScore = res.score;
      }
      const credits = this.distributeCredits(results.data, creditsPerGame);
      console.log(credits);
      for (let res of credits) {
        const player = this.getPlayer(res.playerId);
        player.credits = res.credits;
      }
    }
    this.startResultScreen();
  }

  async startScoreboardScreen() {
    this.phase = "scoreboard";
    this.broadcastLobbyState();

    //1. Uppdatera scores
    this.logger.debug("UPDATING SCORES");
    await sleep(1000);
    for (const [playerId, score] of this.gameScores) {
      this.getPlayer(playerId).score += score;
    }
    this.broadcastLobbyState();
    this.context.io.to(this.context.lobbyId + "_HOST").emit("scoreboard:update");

    //2. Loopa över antal krediter spelarna har fått
    this.logger.debug("UPDATING GLASSES");
    await sleep(5000);
    for (const [playerId, credits] of this.givenCredits) {
      if (credits) {
        this.context.io
          .to(this.context.lobbyId + "_HOST")
          .emit("scoreboard:creditsReceived", playerId, credits);

        const player = this.getPlayer(playerId);
        const currentGlassCount = Math.floor(player.glassLevel);
        player.glassLevel += credits * 0.2;
        const glassesToDrink = Math.floor(player.glassLevel) - currentGlassCount;

        this.drinksToDrink.set(playerId, glassesToDrink);

        this.broadcastLobbyState();
        await sleep(2000);
        this.context.io.to(this.context.lobbyId + "_HOST").emit("scoreboard:update");
        this.getPlayer(playerId).socket.emit("scoreboard:glassesToDrink", glassesToDrink);
        await sleep(5000);
      }
    }
  }

  startResultScreen() {
    this.phase = "result";
    this.broadcastLobbyState();
  }

  onCreditsReceived(id, credits) {
    const player = this.getPlayer(id);
    player.socket.emit("results:creditsConfirmed");
    player.isReady = true;

    for (let c of credits) {
      const current = this.givenCredits.get(c.playerId) ?? 0;
      this.givenCredits.set(c.playerId, current + c.credits);
    }

    if (this.context.players.every((p) => p.isReady || !p.credits)) {
      setTimeout(() => {
        this.advancePhase();
      }, 2000);
    }
  }

  onDrinkConfirmed(playerId) {
    const player = this.getPlayer(playerId);
    const drinks = this.drinksToDrink.get(playerId);
    if (drinks) {
      player.drunkness += drinks;
      this.drinksToDrink.delete(playerId);
    }
    this.broadcastLobbyState();
    this.context.io.to(this.context.lobbyId + "_HOST").emit("scoreboard:update");

    if (this.drinksToDrink.size == 0) {
      setTimeout(() => {
        this.advancePhase();
      }, 5000);
    }
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

  distributeCredits(players, totalCredits) {
    const totalPoints = players.reduce((s, p) => s + p.score, 0);

    // Step 1: ideal allocation
    const allocations = players.map((p) => {
      const exact = (totalCredits * p.score) / totalPoints;
      return {
        ...p,
        exact,
        base: Math.floor(exact),
        remainder: exact - Math.floor(exact),
      };
    });

    // Step 2: distribute remaining credits
    let remaining = totalCredits - allocations.reduce((s, p) => s + p.base, 0);

    allocations.sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < remaining; i++) {
      allocations[i].base += 1;
    }

    // Step 3: return result
    return allocations.map((p) => ({
      playerId: p.playerId,
      credits: p.base,
    }));
  }

  getPlayer(playerId) {
    return this.context.players.find((x) => x.id == playerId);
  }
}
