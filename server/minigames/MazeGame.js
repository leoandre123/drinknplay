import { Minigame } from "../Minigame.js";

export class Mazegame extends Minigame {
    constructor() {
        super();
        this.winner = null;
        this.winnerName = null;
        this.gameActive = false;
    }

    onPlayerJoined(player) {

    }

    onPlayerDisconnected(){

    }

    registerListeners(socket){
        socket.on("maze:finished", () => {
            this.onPlayerFinished(socket.id);
    });
    }

    start() {
        this.winner = null;
        this.winnerName = null;
        this.gameActive = true;
        console.log("Maze game started!");
    }

    getPlayerName(playerId) {
        const p = this.context.players?.find((x) => x.id === playerId);
        return p?.name || p?.playerName || p?.nickname || "Okänd Spelare";
    }

    onPlayerFinished(playerId) {
        if (!this.gameActive || this.winner) return;

        console.log("Player finished:", playerId);

        this.winner = playerId;
        this.winnerName = this.getPlayerName(playerId);
        this.gameActive = false; // Stoppa spelet så ingen annan kan vinna

        this.broadcast("maze:roundResult", {
            winnerId: this.winner,
            winnerName: this.winnerName
        });

        setTimeout(() => {
            this.finishGame();
        }, 5000);
    }

    finishGame() {
        console.log("Maze Game Finished");
        this.onFinished?.([]); 
    }
    }