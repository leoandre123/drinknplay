import type { ServerLobbyContext } from "server/models/ServerLobbyContext.js";
import { Minigame } from "../Minigame.js";
import type { GameResult } from "server/models/GameResult.js";
import type { Player } from "server/models/Player.js";
import type { Host } from "server/models/Host.js";
import { RouletteState, type Bet } from "@shared/features/minigames/roulette/RouletteState.js";

export class RouletteGame extends Minigame {
  phase: string;
  betsByPlayer: Map<string, Bet[]>;
  spinResult: any;

  totalPerPlayer: Map<string, number>;
  round: number;
  maxRounds: number;

  constructor(context: ServerLobbyContext, onFinished: (results: GameResult) => void) {
    super(context, onFinished);
    this.phase = "betting";

    this.betsByPlayer = new Map();
    this.spinResult = null;

    this.totalPerPlayer = new Map();
    this.round = 1;
    this.maxRounds = 3;
  }

  onPlayerJoined(player: Player) {
    if (!this.totalPerPlayer.has(player.id)) {
      this.totalPerPlayer.set(player.id, 0);
    }
    if (!this.betsByPlayer.has(player.id)) {
      this.betsByPlayer.set(player.id, []);
    }

    this.broadcastRouletteState();
  }
  onPlayerRejoined(player: Player) {}
  onPlayerDisconnected(_: Player) {
    this.broadcastRouletteState();
  }
  onHostJoined(host: Host) {
    host.socket.on("roulette:requestState", () => {
      host.socket.emit("roulette:update", RouletteState.toDto(this.getPublicState()));
    });

    host.socket.on("roulette:startSpin", () => {
      this.onStartSpin();
    });

    host.socket.on("roulette:spinResult", ({ number }) => {
      this.onSpinResult(number);
    });
    host.socket.on("roulette:nextRound", () => {
      this.onNextRound();
    });
    host.socket.emit("roulette:update", RouletteState.toDto(this.getPublicState()));
  }
  registerListeners(player: Player) {
    player.communication?.on("roulette:placeBet", (bet: any) => {
      this.onPlaceBet(player.id, bet);
    });
    player.communication?.on("roulette:clearBets", () => {
      this.onClearBets(player.id);
    });
    player.communication?.on("roulette:requestState", () => {
      player.communication?.emit("roulette:update", RouletteState.toDto(this.getPublicState()));
    });

    player.communication?.on("roulette:startSpin", () => {
      this.onStartSpin();
    });

    player.communication?.on("roulette:spinResult", (msg: { number: number }) => {
      this.onSpinResult(msg.number);
    });
    player.communication?.on("roulette:nextRound", () => {
      this.onNextRound();
    });
  }

  unregisterListeners(player: Player) {
    player.communication?.removeAllListeners("roulette:placeBet");
    player.communication?.removeAllListeners("roulette:clearBets");
    player.communication?.removeAllListeners("roulette:requestState");
    player.communication?.removeAllListeners("roulette:startSpin");
    player.communication?.removeAllListeners("roulette:spinResult");
    player.communication?.removeAllListeners("roulette:nextRound");
  }

  start() {
    this.phase = "betting";
    this.betsByPlayer = new Map();
    this.spinResult = null;
    this.round = 1;
    this.totalPerPlayer = new Map();
    this.maxRounds = 3;
    this.broadcastRouletteState();
  }
  stop() {
    this.clearTimeouts();
  }

  onPlaceBet(playerId: string, bet: any) {
    console.log("Bet received");
    //säkerhetåtgärder
    if (this.phase !== "betting") return;
    if (!playerId) return;
    if (!bet || typeof bet.amount !== "number" || bet.amount <= 0) return;
    if (bet.type !== "color" && bet.type !== "number") return;
    console.log("Bet working");
    //0 blir grön, cheeky coolare
    if (bet.type === "number" && bet.value === 0) {
      bet = { type: "color", value: "green", amount: bet.amount };
    }

    if (!this.betsByPlayer.has(playerId)) {
      this.betsByPlayer.set(playerId, []);
    }
    const bets = this.betsByPlayer.get(playerId)!;

    //slå ihop bets om man lägger samma igen
    const index = bets.findIndex((b: any) => b.type === bet.type && b.value === bet.value);
    if (index !== -1) {
      bets[index].amount += bet.amount;
    } else {
      bets.push({ type: bet.type, value: bet.value, amount: bet.amount });
    }
    this.betsByPlayer.set(playerId, bets);
    console.log(this.getPublicState());
    this.broadcastRouletteState();
  }

  onClearBets(playerId: string) {
    if (!this.betsByPlayer.has(playerId)) return;
    this.betsByPlayer.set(playerId, []);
    this.broadcastRouletteState();
  }
  onStartSpin() {
    if (this.phase !== "betting") return;
    this.phase = "spinning";
    this.spinResult = null;

    this.broadcastRouletteState();
  }
  onSpinResult(number: number) {
    if (this.phase !== "spinning") {
      return;
    }
    const color = this.getColor(number);

    this.addRoundResult(number); //ställning
    const winners = [];

    for (const [playerId, playerData] of Object.entries(this.betsByPlayer)) {
      const bets = playerData?.bets ?? [];
      const winningAmount = bets.reduce((sum: number, b: any) => {
        //reducera listan till ett värde
        const net = this.getBetNet(b, number);
        return sum + (net > 0 ? net : 0);
      }, 0); //börja summan på 0
      if (winningAmount > 0) {
        winners.push({ playerId, name: playerData.name, winningAmount });
      }
    }
    this.spinResult = { number, color, winners };
    this.phase = "result";
    this.broadcastRouletteState();
  }

  getColor(number: number) {
    if (number === 0) return "green";
    const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    return red.has(number) ? "red" : "black";
  }
  onNextRound() {
    if (this.phase !== "result") return;

    if (this.round >= this.maxRounds) {
      this.broadcastRouletteState();
      this.onFinished?.({
        type: "credits",
        data: Object.entries(this.totalPerPlayer).map(([playerId, total]) => ({
          playerId: playerId,
          credits: total,
        })),
      });
      return;
    }
    this.round += 1;

    for (const playerData of Object.values(this.betsByPlayer)) {
      playerData.bets = [];
    }
    this.spinResult = null;
    this.phase = "betting";
    this.broadcastRouletteState();
  }
  addRoundResult(winningNumber: number) {
    const roundResultPerPlayer = new Map<string, number>();

    for (const [playerId, entry] of Object.entries(this.betsByPlayer)) {
      const bets = entry.bets || [];
      let roundResult = 0;

      for (const bet of bets) {
        roundResult += this.getBetNet(bet, winningNumber);
      }
      roundResultPerPlayer.set(playerId, roundResult);
      this.totalPerPlayer.set(playerId, (this.totalPerPlayer.get(playerId) ?? 0) + roundResult);
    }
  }
  betWins(bet: Bet, winningNumber: number) {
    if (!bet) return false;
    if (bet.type === "number") {
      return bet.value === winningNumber;
    }
    if (bet.type === "color") {
      const winningColor = this.getColor(winningNumber);
      return bet.value === winningColor;
    }
    return false;
  }

  getBetNet(bet: Bet, winningNumber: number) {
    const amount = bet.amount ?? 0;
    if (amount <= 0) return 0;
    if (!this.betWins(bet, winningNumber)) {
      return -amount;
    }
    if (bet.type === "number") return amount * 36;
    if (bet.type === "color") return amount;
    return 0;
  }

  getPublicState(): RouletteState {
    return {
      phase: this.phase,
      betsByPlayer: this.betsByPlayer,
      spinResult: this.spinResult,
      round: this.round,
      maxRounds: this.maxRounds,
      totalPerPlayer: this.totalPerPlayer,
    };
  }
  broadcastRouletteState() {
    const state = this.getPublicState();
    this.broadcast("roulette:update", RouletteState.toDto(state));
  }
}
