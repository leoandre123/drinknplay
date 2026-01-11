import { Player } from "./models/Player.js";
import { ServerLobbyContext } from "./models/ServerLobbyContext.js";
import { DefaultSettings } from "../shared/GameSettings.js";
import { distributeCredits, distributeScores, GenerateID, sleep } from "./Utils.js";
import { ALL_GAMES } from "./GamesRegistry.js";
import { Logger } from "./Logger.js";
import {
  CREDITS_PER_GLASS,
  CREDITS_PER_ROUND,
  DISCONNECT_TIMEOUT,
  PLAYER_ID_LENGTH,
  TOTAL_SCORE_PER_GAME,
} from "./Constants.js";

export class Lobby {
  constructor(io, lobbyId, settings = DefaultSettings) {
    this.context = new ServerLobbyContext(io, lobbyId);
    this.currentGame = null;
    this.phase = "lobby";
    this.settings = settings;

    this.givenCredits = new Map();
    this.gameScores = new Map();

    this.isAdvancing = false;
    this.logger = new Logger(`LOBBY: ${lobbyId}`);
  }

  onNewPlayerConnection(socket, playerId, name, avatarSettings) {
    this.logger.info(`New connection: ${socket.id}, playerId: ${playerId}, name: ${name}`);
    let player = this.getPlayer(playerId);
    const isNewPlayer = player == undefined;

    if (isNewPlayer) {
      playerId = GenerateID(PLAYER_ID_LENGTH);
      player = new Player(name, playerId, socket, avatarSettings);
    } else {
      player.socket = socket;
    }

    this.onPlayerJoined(player, isNewPlayer);
  }

  onPlayerJoined(player, isNewPlayer) {
    if (!isNewPlayer) {
      this.logger.info(`${player.name} rejoined lobby '${this.context.lobbyId}'`);
      player.connected = true;
      player.disconnectedAt = null;
      clearTimeout(player.disconnectTimer);
    } else {
      this.logger.info(`${player.name} joined lobby '${this.context.lobbyId}'`);
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

    socket.on("lobby:start", () => this.startGameSelection());
    socket.on("lobby:advancePhase", () => this.advancePhase());

    socket.emit("lobby:joinHostResponse", this.context.lobbyId);

    this.broadcastLobbyState();
    if (this.phase == "game") {
      this.currentGame?.onHostJoined(socket);
    }
  }

  //Anropas när en spelare har tappats kontakten med
  onPlayerDisconnected(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.connected = false;
    player.disconnectedAt = Date.now();
    player.socket = null;

    player.disconnectTimer = setTimeout(() => {
      this.onPlayerLeft(playerId);
    }, DISCONNECT_TIMEOUT);
  }

  //Anropas efter att en spelare har varit bortkopplad i x antal sekunder
  onPlayerLeft(playerId) {
    const playerIndex = this.context.players.findIndex((x) => x.id == playerId);
    if (playerIndex == -1) return;
    const playersToRemove = this.context.players.splice(playerIndex, 1);

    if (playersToRemove.length != 0) {
      this.logger.info(`${playersToRemove[0].name} left the lobby '${this.context.lobbyId}'`);
      this.broadcastLobbyState();
      if (this.phase == "game") {
        this.currentGame?.onPlayerDisconnected(playersToRemove[0]);
        if (playersToRemove[0].socket)
          this.currentGame?.unregisterListeners(playersToRemove[0].socket);
      }
    }

    this.tryAdvance(0);
  }

  /*
   * FASER
   */
  startGameSelection(gameIndex = -1) {
    this.phase = "slot";
    this.broadcastLobbyState();

    setTimeout(() => {
      if (gameIndex == -1) gameIndex = Math.floor(Math.random() * ALL_GAMES.length);

      this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("startSpin", gameIndex);
      this.context.io.to(this.context.lobbyId + "_HOST").emit("startSpin", gameIndex);

      this.logger.debug(`Selecting game: ${gameIndex}`);
      this.gameIndex = gameIndex;
      const game = ALL_GAMES[gameIndex];
      if (game) {
        this.currentGame = new game();
      } else {
        this.logger.error(`No game with index ${gameIndex}`);
      }
    }, 3000);

    this.tryAdvance(10000);
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
      if (player.socket) this.currentGame.registerListeners(player.socket);
    }
    //host joinar vid lobbyfasen, dvs innan gamefasen, o joinar inte vid minigamebyte
    //Host aktiv i roulette,så host socketen behöver listeners från onHostJoined()
    //inte bara i lobbyfasen
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

    for (let player of this.context.players) {
      if (player.socket) this.currentGame.unregisterListeners(player.socket);
    }

    this.context.players.forEach((p) => {
      p.isReady = false;
      p.gameScore = 0;
    });
    this.givenCredits.clear();
    this.gameScores.clear();

    let credits = [];
    let scores = [];

    if (results?.type == "credits") {
      credits = results.data ?? [];
    } else if (results?.type == "scores") {
      const creditsPerGame = CREDITS_PER_ROUND[this.settings.drunknessLevel];
      credits = distributeCredits(results.data, creditsPerGame);
      scores = results.data ?? [];
    }

    for (let res of credits) {
      const player = this.getPlayer(res.playerId);
      if (res.credits < 0) {
        this.givenCredits.set(res.playerId, Math.abs(res.credits));
      } else {
        player.credits = res.credits;
      }
    }

    scores = distributeScores(scores, TOTAL_SCORE_PER_GAME);

    for (let res of scores) {
      this.gameScores.set(res.playerId, res.score);
      const player = this.getPlayer(res.playerId);
      player.gameScore = res.score;
    }

    this.logger.debug(this.context.players);
    this.startResultScreen();
  }

  startResultScreen() {
    this.phase = "result";
    this.broadcastLobbyState();
  }

  async startScoreboardScreen() {
    this.phase = "scoreboard";
    this.broadcastLobbyState();

    //1. Uppdatera scores
    this.logger.debug("UPDATING SCORES");
    await sleep(1000);
    for (const player of this.context.players) {
      player.score += player.gameScore;
      player.gameScore = 0;
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
        if (!player) continue;

        this.logger.debug(`${player.name} received ${credits} credits`);
        const currentGlassCount = Math.floor(player.glassLevel);
        player.glassLevel += credits / CREDITS_PER_GLASS;
        const glassesToDrink = Math.floor(player.glassLevel) - currentGlassCount;
        player.glassesToDrink = glassesToDrink;

        this.broadcastLobbyState();
        await sleep(2000);
        this.context.io.to(this.context.lobbyId + "_HOST").emit("scoreboard:update");
        await sleep(5000);
      }
    }

    this.tryAdvance(5000);
  }

  /*
   * CALLBACKS
   */

  onCreditsReceived(id, credits) {
    const player = this.getPlayer(id);
    player.socket.emit("results:creditsConfirmed");
    player.isReady = true;

    for (let c of credits) {
      const current = this.givenCredits.get(c.playerId) ?? 0;
      this.givenCredits.set(c.playerId, current + c.credits);
    }

    this.tryAdvance(2000);
  }

  onDrinkConfirmed(playerId) {
    const player = this.getPlayer(playerId);
    if (player.glassesToDrink) {
      player.drunkness += player.glassesToDrink;
      player.glassesToDrink = 0;
    }
    this.broadcastLobbyState();
    this.context.io.to(this.context.lobbyId + "_HOST").emit("scoreboard:update");

    this.tryAdvance(5000);
  }

  onPlayerReady(id, isReady) {
    if (this.phase != "loading") return;
    const player = this.context.players.find((x) => x.id == id);
    player.isReady = isReady;
    this.broadcastLobbyState();

    this.tryAdvance();
  }

  /*
   * HELPERS
   */

  //Går vidare till nästa fas
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
        this.finishGame({ type: "", data: [] });
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

  //Kollar ifall något hindrar och går annars till nästa fas
  tryAdvance(delay = 0) {
    if (this.isAdvancing) return;
    if (this.context.players.length == 0) return;

    this.logger.debug(`Trying to advance from ${this.phase}`);

    if (this.phase == "loading") {
      if (this.context.players.filter((p) => p.isReady).length < this.context.players.length / 2)
        return;
    } else if (this.phase == "result") {
      if (this.context.players.some((p) => !p.isReady && p.credits > 0)) return;
    } else if (this.phase == "scoreboard") {
      if (this.context.players.some((p) => p.glassesToDrink)) return;
    }

    this.logger.debug(`Success! Advancing in ${delay} ms...`);

    this.isAdvancing = true;

    setTimeout(() => {
      this.isAdvancing = false;
      this.advancePhase();
    }, delay);
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

  getPlayer(playerId) {
    return this.context.players.find((x) => x.id == playerId);
  }
}
