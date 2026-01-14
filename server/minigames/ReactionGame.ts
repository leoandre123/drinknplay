import { Minigame } from "../Minigame.js";
import type { ServerLobbyContext } from "server/models/ServerLobbyContext.js";
import type { GameResult } from "server/models/GameResult.js";
import type { Host } from "server/models/Host.js";
import type { Player } from "server/models/Player.js";
import { FIGURE_COUNT_PER_ROUND, MAX_REACTION_ROUNDS } from "../../shared/Constants.js";

export class ReactionGame extends Minigame {
  submissions: any[];
  currentRound: number;
  maxRounds: number;
  figureCount: number;
  winner: any;
  figurePositions: any[];
  scores: Map<string, number>;
  roundStartTime: number;

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);
    this.submissions = [];
    this.currentRound = 0;
    this.maxRounds = MAX_REACTION_ROUNDS;
    this.figureCount = 0;
    this.winner = null;
    this.figurePositions = [];
    this.scores = new Map();
    this.roundStartTime = 0;
  }

  onPlayerJoined(player: Player) {
    if (!this.scores.has(player.id)) {
      this.scores.set(player.id, 0);
    }
    this.emitToPlayer(player.id, "player:yourId", player.id);
  }

  onPlayerDisconnected(player: Player) {
    this.submissions = this.submissions.filter((x) => x.id !== player.id);
  }

  onHostJoined(_: Host) {}

  registerListeners(player: Player) {
    player.communication?.on("reaction:submit", ({ amount, time }) => {
      this.onSubmit(player.id, amount, time);
    });
  }

  unregisterListeners(player: Player) {
    player.communication?.removeAllListeners("reaction:submit");
  }

  start() {
    this.startRound();
  }
  stop() {}

  generatePositions(count: number) {
    const containerW = 100;
    const containerH = 55;
    const figureW = 7;
    const half = figureW / 2;
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    return Array.from({ length: count }, () => ({
      leftVh: rand(half + 1, containerW - half - 1),
      topVh: rand(half + 1, containerH - half - 1),
    }));
  }

  startRound() {
    this.submissions = [];
    this.winner = null;
    this.roundStartTime = Date.now();
    this.figureCount = Math.floor(Math.random() * FIGURE_COUNT_PER_ROUND + 1);
    this.figurePositions = this.generatePositions(this.figureCount);

    this.broadcast("reaction:startRound", {
      figureCount: this.figureCount,
      positions: this.figurePositions,
    });

    this.broadcast("reaction:resetAmounts");
  }

  onSubmit(playerId: string, amount: number, submitTime: number) {
    if (this.winner) return;

    const existing = this.submissions.find((x) => x.id === playerId);
    if (existing) return;

    const responseTime = submitTime - this.roundStartTime;
    const points = Math.round(Math.max(1200 - responseTime / 12, 0));

    amount = Number(amount);

    this.submissions.push({ id: playerId, amount, time: responseTime });
    this.broadcast("reaction:playerAmount", { playerId, amount });

    if (amount === this.figureCount) {
      this.winner = playerId;

      const currentScore = this.scores.get(playerId) || 0;

      this.scores.set(playerId, currentScore + points);

      this.broadcast("reaction:roundResult", {
        winner: this.winner,
        scores: Object.fromEntries(this.scores),
      });
      this.finishRound();
      console.log("ROUND FINISHED WITH WINNER:", this.winner);
      return;
    }

    const totalPlayers = this.context.players.length;
    if (this.submissions.length >= totalPlayers) {
      this.finishRound();
      this.broadcast("reaction:roundResult", {
        winner: null,
        winnerName: null,
        scores: Object.fromEntries(this.scores),
      });
    }
  }
  finishRound() {
    console.log("ROUND FINISHED");
    this.currentRound++;

    if (this.currentRound < this.maxRounds) {
      this.submissions = [];
      setTimeout(() => this.startRound(), 1500);
      console.log("STARTING NEW ROUND");
      return;
    } else {
      console.log("GAME FINISHED");
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
}
