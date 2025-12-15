import { Minigame } from "../Minigame.js";

export class ReactionGame extends Minigame {
    constructor() {
        super();
        this.submissions = []; // { id, amount }
        this.currentRound = 0;
        this.maxRounds = 10;
    }

    onPlayerJoined(player) {

    }

    onPlayerDisconnected(player) {
        this.submissions = this.submissions.filter((x) => x.id !== player.id);
    }

    registerListeners(socket) {
        socket.on("reaction:submit", (amount) => this.onSubmit(socket.id, amount));
    }

    unregisterListeners(socket) {
        socket.removeAllListeners("reaction:submit");
    }

    start() {
        this.submissions = [];
    }

    stop() {
        this.roundActive = false;
    }

    onSubmit(playerId, amount) {
        console.log("onSubmit called", { amount, playerId });

        const existing = this.submissions.find((x) => x.id === playerId);
        console.log("existing submission:", existing);

        if (existing) return;

        this.submissions.push({ id: playerId, amount });
        this.emitToPlayer(playerId, "reaction:submitted", amount);
        this.broadcastHosts("reaction:setSubmissions", this.submissions);

        const totalPlayers = this.context.players.length;
        if (this.submissions.length >= totalPlayers) {
            this.finishRound();
        }
    }

    finishRound() {
        this.currentRound++;

        if (this.currentRound < this.maxRounds) {
            this.submissions = [];
            this.broadcast("reaction:startRound");
            this.broadcastHosts("reaction:setSubmissionCount", 0);
            return;
        } else {
            this.onFinished?.();
        }
    }
}
