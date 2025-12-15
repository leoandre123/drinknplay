import { Minigame } from "../Minigame.js";

export class ReactionGame extends Minigame {
    constructor() {
        super();
        this.submissions = [];
        this.currentRound = 0;
        this.maxRounds = 10;
        this.figureCount = 0;
        this.winner = null;
        this.scores = new Map();
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
        socket.on("reaction:submit", ({amount, time}) => {
            this.onSubmit(socket.id, amount, time);
        });
    }

    unregisterListeners(socket) {
        socket.removeAllListeners("reaction:submit");
    }

    start() {
        this.startRound();
    }

    startRound() {
        this.submissions = [];
        this.winner = null;
        this.amount = 0;
        this.roundStartTime = Date.now();
        this.figureCount = Math.floor(Math.random() * 5 + 1);
        this.broadcast("reaction:startRound", this.figureCount);
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
        console.log(this.figureCount, amount, playerId, responseTime);

        if (amount === this.figureCount) {
            this.winner = playerId;
            
            const currentScore = this.scores.get(playerId) || 0;

            this.scores.set(playerId, currentScore + responseTime);
            console.log("Player", playerId, "is the winner of this round! Score:", this.scores.get(playerId));

            this.broadcast("reaction:roundResult", {
                winner: playerId,
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
                scores: Object.fromEntries(this.scores),
            });
        }
    }
    finishRound() {
        console.log("ROUND FINISHED");
        this.currentRound++;

        if (this.currentRound < this.maxRounds) {
            this.submissions = [];
            setTimeout(()=>this.startRound(),1500);
            console.log("STARTING NEW ROUND");
            return;
        } else {
            console.log("GAME FINISHED");
            this.onFinished?.([]);
        }
    }
}
