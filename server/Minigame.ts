import { Logger } from "./Logger";
import type { GameResult } from "./models/GameResult";
import { Host } from "./models/Host";
import { Player } from "./models/Player";
import { ServerLobbyContext } from "./models/ServerLobbyContext";

export abstract class Minigame {
  context: ServerLobbyContext;
  onFinished: (results: GameResult) => void;
  timeouts: NodeJS.Timeout[] = [];

  logger: Logger;

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    this.context = context;
    this.onFinished = onFinished;
    this.logger = new Logger(`LOBBY: ${this.context?.lobbyId} - ${this.constructor.name}`);
  }

  abstract onPlayerJoined(player: Player): void;
  abstract onPlayerRejoined(player: Player): void;
  abstract onPlayerDisconnected(player: Player): void;

  abstract onHostJoined(host: Host): void;

  abstract registerListeners(player: Player): void;
  abstract unregisterListeners(player: Player): void;

  abstract start(): void;
  abstract stop(): void;

  setSafeTimeout(callback: () => void, delay: number) {
    const timeout = setTimeout(callback, delay);
    this.timeouts.push(timeout);
    return timeout;
  }

  clearTimeouts() {
    this.timeouts.forEach((t) => clearTimeout(t));
  }

  emitToPlayer(playerId: string, ev: string, ...args: any[]) {
    this.context?.players.find((x) => x.id == playerId)?.communication?.emit(ev, ...args);
  }

  broadcast(ev: string, ...args: any[]) {
    this.context?.io.to(this.context.lobbyId + "_PLAYERS").emit(ev, ...args);
    this.context?.io.to(this.context.lobbyId + "_HOST").emit(ev, ...args);
  }

  broadcastHosts(ev: string, ...args: any[]) {
    this.context?.io.to(this.context.lobbyId + "_HOST").emit(ev, ...args);
  }

  broadcastPlayers(ev: string, ...args: any[]) {
    this.context?.io.to(this.context.lobbyId + "_PLAYERS").emit(ev, ...args);
  }
}

export type MinigameCtor = new (
  context: ServerLobbyContext,
  onFinished: (results: GameResult) => void
) => Minigame;
