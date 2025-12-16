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
            this.broadcastHosts("reaction:playerAmount", {
                socketId: socket.id,
                amount: Number(amount),
            })
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
        const containerW = 100; // vh
        const containerH = 55;  // vh

        const figureW = 7;      // vh (matchar CSS width: 7vh)
        const half = figureW / 2;
        const pad = 1;          // extra marginal i vh

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
        this.submissionpermitted = false;
        this.figureCount = Math.floor(Math.random() * 5 + 1);
        this.figurePositions = this.generatePositions(this.figureCount);

        this.broadcast("reaction:startRound", {
            figureCount: this.figureCount,
            positions: this.figurePositions,
        });
    }

    stop() {
        this.roundActive = false;
    }

    onSubmit(playerId, amount, submitTime) {
        console.log("onSubmit called", { amount, playerId });
        if (this.winner) return;

        const existing = this.submissions.find((x) => x.id === playerId);
        console.log("existing submission:", existing);
        if (existing) return;

        const responseTime = submitTime - this.roundStartTime;
        amount = Number(amount);

        this.submissions.push({ id: playerId, amount, time: responseTime });

        if (amount === this.figureCount) {
            this.winner = playerId;
            this.winnerName = this.getPlayerName(playerId);
            this.amount = amount;

            const currentScore = this.scores.get(playerId) || 0;

            this.scores.set(playerId, currentScore + responseTime);
            console.log("Player", playerId, "is the winner of this round! Score:", this.scores.get(playerId));

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
        console.log("ROUND FINISHED");
        this.submissionpermitted = false;
        this.currentRound++;

        if (this.currentRound < this.maxRounds) {
            this.submissions = [];
            setTimeout(() => this.startRound(), 1500);
            console.log("STARTING NEW ROUND");
            return;
        } else {
            console.log("GAME FINISHED");
            this.onFinished?.([]);
        }
    }
}
