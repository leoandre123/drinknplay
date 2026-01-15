import { Player } from "./models/Player";
import { ServerLobbyContext } from "./models/ServerLobbyContext";
import { distributeCredits, distributeScores, GenerateID, sleep } from "./Utils";
import { ALL_GAMES } from "./GamesRegistry";
import { Logger } from "./Logger";

import type { GamePhase } from "../shared/models/GamePhase";
import { DefaultSettings, type GameSettings } from "../shared/models/GameSettings";
import type { AvatarSettings } from "../shared/models/AvatarSettings";

import { Host } from "./models/Host";
import type { Minigame } from "./Minigame";
import type { Server, Socket } from "socket.io";

import { SocketCommunication } from "./communication/SocketCommunication";
import {
  CREDITS_PER_GLASS,
  CREDITS_PER_ROUNDPLAYER,
  DISCONNECT_TIMEOUT,
  PLAYER_ID_LENGTH,
  TOTAL_SCORE_PER_GAME,
} from "../shared/Constants";
import type { GameResult } from "./models/GameResult.ts";
import { LOBBY_JOIN_AS_PLAYER_RESPONSE } from "@shared/contracts/socket-events.ts";
import type { JoinLobbyResponse } from "@shared/contracts/types.ts";

export class Lobby {
  context: ServerLobbyContext;
  currentGameIndex: number;
  currentGame?: Minigame;
  phase: GamePhase = "lobby";
  settings: GameSettings;

  givenCredits: Map<string, number>;

  isAdvancing = false;
  logger: Logger;

  currentRound = 0;

  constructor(io: Server, lobbyId: string, settings: GameSettings = DefaultSettings) {
    this.context = new ServerLobbyContext(io, lobbyId);

    this.phase = "lobby";
    this.settings = settings;

    this.givenCredits = new Map();
    this.logger = new Logger(`LOBBY: ${lobbyId}`);

    this.currentGameIndex = -1;
  }

  onNewPlayerConnection(
    socket: Socket,
    playerId: string,
    name: string,
    avatarSettings: AvatarSettings
  ) {
    this.logger.info(`New connection: ${socket.id}, playerId: ${playerId}, name: ${name}`);
    let player = this.getPlayer(playerId);
    const isNewPlayer = player == undefined;

    const comm = new SocketCommunication(socket);

    if (isNewPlayer) {
      if (this.context.players.length >= this.settings.maxPlayers) return;
      playerId = GenerateID(PLAYER_ID_LENGTH);
      player = new Player(name, playerId, comm, avatarSettings);
    } else {
      player!.communication = comm;
      console.log("NEW SOCCOM CREATED");
      console.log(player?.communication);
    }

    socket.data.lobbyId = this.context.lobbyId;
    socket.data.playerId = playerId;

    this.onPlayerJoined(player!, isNewPlayer);
  }

  onPlayerJoined(player: Player, isNewPlayer: boolean) {
    if (!isNewPlayer) {
      this.logger.info(`${player.name} rejoined lobby '${this.context.lobbyId}'`);
      player.connected = true;
      player.disconnectedAt = undefined;
      clearTimeout(player.disconnectTimer);
    } else {
      this.logger.info(`${player.name} joined lobby '${this.context.lobbyId}'`);
      this.context.players.push(player);
    }

    this.logger.debug(this.context.players);

    player.communication!.join(this.context.lobbyId + "_PLAYERS");

    this.registerPlayerListeners(player);

    const resp: JoinLobbyResponse = {
      success: true,
      lobbyId: this.context.lobbyId,
      playerId: player.id,
    };
    player.communication!.emit(LOBBY_JOIN_AS_PLAYER_RESPONSE, resp);

    this.broadcastLobbyState();
    if (this.phase == "game") {
      if (isNewPlayer) {
        this.currentGame?.onPlayerJoined(player);
      }
      this.currentGame?.registerListeners(player);
    }
  }

  registerPlayerListeners(player: Player) {
    player.communication!.on("results:confirmCredits", (credits) =>
      this.onCreditsReceived(player.id, credits)
    );
    player.communication!.on("scoredboard:confirmDrink", () => this.onDrinkConfirmed(player.id));
    player.communication!.on("ready", (isReady) => {
      this.onPlayerReady(player.id, isReady);
    });
  }

  onHostJoined(socket: Socket) {
    this.logger.info(`Host ${socket.id} connected`);
    const host = new Host(socket);
    this.context.hosts.push(host);

    socket.join(this.context.lobbyId + "_HOST");
    socket.data.lobbyId = this.context.lobbyId;

    socket.on("lobby:start", () => this.startGameSelection());
    socket.on("lobby:updateSettings", (settings) => this.onSettingsChanged(settings));
    socket.on("lobby:advancePhase", () => this.advancePhase());

    socket.emit("lobby:joinHostResponse", this.context.lobbyId);

    this.broadcastLobbyState();
    if (this.phase == "game") {
      this.currentGame?.onHostJoined(host);
    }
  }

  onHostDisconnected(socket: Socket) {
    this.logger.info(`Host ${socket.id} disonnected`);
    this.context.hosts = this.context.hosts.filter((x) => x.socket.id != socket.id);
  }

  //Anropas när en spelare har tappats kontakten med
  onPlayerDisconnected(playerId: string) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.connected = false;
    player.disconnectedAt = Date.now();
    player.communication = undefined;

    player.disconnectTimer = setTimeout(() => {
      this.onPlayerLeft(playerId);
    }, DISCONNECT_TIMEOUT);
  }

  //Anropas efter att en spelare har varit bortkopplad i x antal sekunder
  onPlayerLeft(playerId: string) {
    const playerIndex = this.context.players.findIndex((x) => x.id == playerId);
    if (playerIndex == -1) return;
    const playersToRemove = this.context.players.splice(playerIndex, 1);

    if (playersToRemove.length != 0) {
      this.logger.info(`${playersToRemove[0].name} left the lobby '${this.context.lobbyId}'`);
      this.broadcastLobbyState();
      if (this.phase == "game") {
        this.currentGame?.onPlayerDisconnected(playersToRemove[0]);
        this.currentGame?.unregisterListeners(playersToRemove[0]);
      }
    }

    this.tryAdvance(0);
  }

  /*
   * FASER
   */
  startGameSelection() {
    this.phase = "slot";
    this.broadcastLobbyState();

    setTimeout(() => {
      const gameIndex = Math.floor(Math.random() * ALL_GAMES.length);
      this.selectGame(gameIndex);
      this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("startSpin", gameIndex);
      this.context.io.to(this.context.lobbyId + "_HOST").emit("startSpin", gameIndex);
    }, 3000);

    setTimeout(() => {
      this.advancePhase();
    }, 10000);
  }

  selectGame(gameIndex: number) {
    this.logger.debug(`Selecting game: ${gameIndex}`);
    this.currentGameIndex = gameIndex;
    const game = ALL_GAMES[gameIndex];
    if (game) {
      this.currentGame = new game(this.context, (results) => this.finishGame(results));
    } else {
      this.logger.error(`No game with index ${gameIndex}`);
    }
  }

  startLoadingScreen() {
    this.context.players.forEach((p) => (p.isReady = false));
    this.phase = "loading";
    this.broadcastLobbyState();
  }

  startMinigame() {
    this.currentRound++;
    this.phase = "game";
    this.broadcastLobbyState();

    if (!this.currentGame) {
      this.logger.error("Current minigame is undefined");
      return;
    }

    this.currentGame.context = this.context;

    for (const player of this.context.players) {
      this.currentGame?.onPlayerJoined(player);
      this.currentGame.registerListeners(player);
    }

    for (const host of this.context.hosts) {
      this.currentGame?.onHostJoined(host);
    }

    this.currentGame.onFinished = (results) => this.finishGame(results);
    this.currentGame.start();
  }

  finishGame(results: GameResult) {
    this.logger.info("Game Finished!");
    this.logger.debug(results);

    if (!results) {
      this.logger.error(`Minigame of type ${typeof this.currentGame} didn't provide any results`);
      return;
    }

    for (const player of this.context.players) {
      this.currentGame?.unregisterListeners(player);
    }
    //TODO: Remove host listeners
    //for (const host of this.context.hosts) {
    //  this.currentGame?.unregisterListeners(host);
    //}

    this.context.players.forEach((p) => {
      p.isReady = false;
      p.gameScore = 0;
    });
    this.givenCredits.clear();

    let credits = [];
    let scores = [];

    if (results?.type == "credits") {
      credits = results.data ?? [];
    } else if (results?.type == "scores") {
      credits = distributeCredits(
        results.data,
        CREDITS_PER_ROUNDPLAYER[this.settings.drunknessLevel] * results.data.length
      );
      scores = results.data ?? [];
    } else if (results?.type == "ranking") {
      credits = distributeCredits(
        results.data.map((x, i) => ({ playerId: x.id, score: results.data.length - i })),
        CREDITS_PER_ROUNDPLAYER[this.settings.drunknessLevel] * results.data.length
      );
      scores = results.data ?? [];
    }

    this.logger.debug(credits);
    this.logger.debug(scores);

    for (let res of credits) {
      const player = this.getPlayer(res.playerId);
      if (!player) continue;
      if (res.credits < 0) {
        this.givenCredits.set(res.playerId, Math.abs(res.credits));
        player.credits = 0;
      } else {
        player.credits = res.credits;
      }
    }

    scores = distributeScores(scores, TOTAL_SCORE_PER_GAME);

    for (let res of scores) {
      const player = this.getPlayer(res.playerId);
      if (player) player.gameScore = res.score;
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

  startFinalResultScreen() {
    this.phase = "end";
    this.broadcastLobbyState();
  }

  /*
   * CALLBACKS
   */

  onCreditsReceived(playerId: string, credits: { playerId: string; credits: number }[]) {
    const player = this.getPlayer(playerId);
    if (!player) {
      this.logger.warn(`Credits received from a player that doesn't exist: ${playerId}`);
      return;
    }
    player.communication?.emit("results:creditsConfirmed");
    player.isReady = true;

    for (let c of credits) {
      const current = this.givenCredits.get(c.playerId) ?? 0;
      this.givenCredits.set(c.playerId, current + c.credits);
    }

    this.tryAdvance(2000);
  }

  onDrinkConfirmed(playerId: string) {
    const player = this.getPlayer(playerId);
    if (!player) {
      this.logger.warn(`Drink confirmed from a player that doesn't exist: ${playerId}`);
      return;
    }
    if (player.glassesToDrink) {
      player.drunkness += player.glassesToDrink;
      player.glassesToDrink = 0;
    }
    this.broadcastLobbyState();
    this.context.io.to(this.context.lobbyId + "_HOST").emit("scoreboard:update");

    this.tryAdvance(5000);
  }

  onPlayerReady(playerId: string, isReady: boolean) {
    if (this.phase != "loading") return;

    const player = this.getPlayer(playerId);
    if (!player) {
      this.logger.warn(`Ready up from a player that doesn't exist: ${playerId}`);
      return;
    }
    player.isReady = isReady;
    this.broadcastLobbyState();
    this.tryAdvance();
  }

  onSettingsChanged(settings: GameSettings) {
    this.logger.debug("Settings changed");
    this.settings = settings;
    this.broadcastLobbyState();
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
        this.finishGame({ type: "scores", data: [] });
        this.startResultScreen();
        break;
      case "result":
        this.startScoreboardScreen();
        break;
      case "scoreboard":
        if (this.currentRound >= this.settings.numberOfRounds) {
          this.startFinalResultScreen();
        } else {
          this.startGameSelection();
        }

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
      players: this.context.players.map((p) => p.toDto()),
      settings: this.settings,
      phase: this.phase,
      gameIndex: this.currentGameIndex,
    };
    this.context.io.to(this.context.lobbyId + "_PLAYERS").emit("lobby:updateState", state);
    this.context.io.to(this.context.lobbyId + "_HOST").emit("lobby:updateState", state);
  }

  getPlayer(playerId: string) {
    return this.context.players.find((x) => x.id == playerId);
  }
}
