import { Minigame } from "../Minigame.js";

export class Mazegame extends Minigame {
    constructor() {
        super();
        this.winner = null;
        this.winnerName = null;
        this.gameActive = false;
        this.scores = new Map();
    }

    onPlayerJoined(player) {
        if (!this.scores.has(player.id)) {
            this.scores.set(player.id, 0);
        }
    }

    onPlayerDisconnected() {
        if (this.scores.has(player.id)) {
            this.scores.delete(player.id);
        }
    }

    registerListeners(socket) {
        socket.on("maze:finished", ({ time }) => {
            this.onPlayerFinished(socket.data.playerId, time);
        });
    }

    start() {
        this.winner = null;
        this.winnerName = null;
        this.gameActive = true;
        this.roundStartTime = Date.now();
        console.log("Maze game started!");
    }

    getPlayerName(playerId) {
        const p = this.context.players?.find((x) => x.id === playerId);

        return p?.name || p?.playerName || p?.nickname || "Okänd Spelare";
    }

    onPlayerFinished(playerId, playerTime) {
        if (!this.gameActive || this.winner) return;

        this.winner = playerId;
        this.winnerName = this.getPlayerName(playerId);
        this.gameActive = false; 

        console.log("Player finished:", this.winnerName);

        const finishTime = playerTime - this.roundStartTime;

        console.log(finishTime);
        const finishScore = Math.floor(finishTime / 20);
        console.log(finishScore);

        this.scores.set(playerId, finishScore);

        this.broadcast("maze:roundResult", {
            winnerId: this.winner,
            winnerName: this.winnerName,
            scores: Object.fromEntries(this.scores),
        });

        setTimeout(() => {
            this.finishGame();
        }, 5000);
    }

    finishGame() {
        console.log("Maze Game Finished");
        const results = [];
        this.scores.forEach((score, id) => {
            results.push({ id: id, score: score });
        });
        this.onFinished?.(results);
    }
}