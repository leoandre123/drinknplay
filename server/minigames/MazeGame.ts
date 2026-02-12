import type { GameResult } from "server/models/GameResult.ts";
import type { Host } from "server/models/Host.ts";
import type { Player } from "server/models/Player.ts";
import type { ServerLobbyContext } from "server/models/ServerLobbyContext.ts";
import { Minigame } from "server/Minigame.js";

export class Mazegame extends Minigame {
  winner: string | undefined;
  gameActive: boolean;
  scores: Map<string, number>;
  roundStartTime: number;

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);
    this.winner = undefined;
    this.gameActive = false;
    this.scores = new Map();
    this.roundStartTime = 0;
  }

  onPlayerJoined(player: Player) {
    if (!this.scores.has(player.id)) {
      this.scores.set(player.id, 0);
    }
  }
  onPlayerRejoined(player: Player) {}
  onPlayerDisconnected(player: Player) {
    if (this.scores.has(player.id)) {
      this.scores.delete(player.id);
    }
  }

  onHostJoined(_: Host) {}

  registerListeners(player: Player) {
    player.communication?.on("maze:finished", (msg: { time: number }) => {
      this.onPlayerFinished(player.id, msg.time);
    });
  }
  unregisterListeners(player: Player) {
    player.communication;
  }

  start() {
    this.winner = undefined;
    this.gameActive = true;
    this.roundStartTime = Date.now();
    console.log("Maze game started!");
  }
  stop() {}

  onPlayerFinished(playerId: string, playerTime: number) {
    if (!this.gameActive || this.winner) return;

    this.winner = playerId;
    this.gameActive = false;
    const finishTime = playerTime - this.roundStartTime;

    console.log(finishTime);
    const finishScore = Math.floor(finishTime / 20);
    console.log(finishScore);

    this.scores.set(playerId, finishScore);

    this.broadcast("maze:roundResult", {
      winnerId: this.winner,
      scores: Object.fromEntries(this.scores),
    });

    setTimeout(() => {
      this.finishGame();
    }, 5000);
  }

  finishGame() {
    console.log("Maze Game Finished");
    const results: GameResult = {
      type: "scores",
      data: [...this.scores].map(([playerId, score]) => ({
        playerId,
        score,
      })),
    };
    this.onFinished?.(results);
  }
}
