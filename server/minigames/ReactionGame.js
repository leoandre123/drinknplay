import { Minigame } from "../Minigame.js";

export class ReactionGame extends Minigame {
    constructor() {
        super();
        this.submissions = [];
        this.currentRound = 0;
        this.maxRounds = 10;
        this.figureCount = 0;
        this.winner = null;
        this.figurePositions = [];
        this.winnername = null;
        this.scores = new Map();
        this.roundActive = false;

    }

    onPlayerJoined(player) {
        if (!this.scores.has(player.id)) {
            this.scores.set(player.id, 0);
        }
    }

    onPlayerDisconnected(player) {
        this.submissions = this.submissions.filter((x) => x.id !== player.id);
    }

    registerListeners(socket) {
        socket.on("reaction:submit", ({ amount, time }) => {
            this.onSubmit(socket.id, amount, time);
        });

    }

    unregisterListeners(socket) {
        socket.removeAllListeners("reaction:submit");
    }

    start() {
        this.startRound();
    }

    getPlayerName(playerId) {
        const p = this.context.players?.find((x) => x.id === playerId);
        return p?.name || p?.playerName || p?.nickname || "Player";
    }

    generatePositions(count) {
        const containerW = 100; 
        const containerH = 55;  
        const figureW = 7;     
        const half = figureW / 2;
        const pad = 1;      
        const rand = (min, max) => Math.random() * (max - min) + min;

        return Array.from({ length: count }, () => ({
            leftVh: rand(half + pad, containerW - half - pad),
            topVh: rand(half + pad, containerH - half - pad),
        }));
    }

    startRound() {
        this.submissions = [];
        this.winner = null;
        this.winnerName = null;
        this.roundStartTime = Date.now();
        this.figureCount = Math.floor(Math.random() * 14 + 1);
        this.figurePositions = this.generatePositions(this.figureCount);

        this.broadcast("reaction:startRound", {
            figureCount: this.figureCount,
            positions: this.figurePositions,
        });
          this.broadcast("reaction:resetAmounts");
    }

    stop() {
        this.roundActive = false;
    }

    onSubmit(playerId, amount, submitTime) {
        if (this.winner) return;

        const existing = this.submissions.find((x) => x.id === playerId);
        if (existing) return;

        const responseTime = submitTime - this.roundStartTime;

        amount = Number(amount);

        this.submissions.push({ id: playerId, amount, time: responseTime });
        this.broadcast("reaction:playerAmount", { playerId, amount });

        if (amount === this.figureCount) {
            this.winner = playerId;
            this.winnerName = this.getPlayerName(playerId);
            this.amount = amount;

            const currentScore = this.scores.get(playerId) || 0;

            this.scores.set(playerId, currentScore + responseTime);

            this.broadcast("reaction:roundResult", {
                winner: this.winner,
                winnerName: this.winnerName,
                scores: Object.fromEntries(this.scores),
            });
            this.finishRound();
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
    
        this.currentRound++;

        if (this.currentRound < this.maxRounds) {
            this.submissions = [];
            setTimeout(() => this.startRound(), 1500);
            return;
        }
        else {
            console.log("GAME FINISHED");
            this.onFinished?.([]);
        }
    }
}
