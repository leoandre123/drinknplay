import { Minigame } from "../Minigame.js";

export class RouletteGame extends Minigame {
    constructor() {
        super();
        console.log("Roulette constructor running")
        //lägg tll spin och resultat sen
        this.phase = "betting";

        this.betsByPlayer = {};
    }

    onPlayerJoined(player) {
        if (!this.betsByPlayer[player.id]) {
            this.betsByPlayer[player.id] = { name: player.name, bets: [] };
        }
        else {
            this.betsByPlayer[player.id].name = player.name; //upd namn vid återanslutning
        }
        this.broadcastRouletteState(); //upd host när npgon joinar
    }

    onPlayerDisconnected(player) {
        this.broadcastRouletteState();
    }

    registerListeners(socket) {
        console.log("roulette.registerlistener")

        socket.on("roulette:placeBet", (bet) =>
            this.onPlaceBet(socket.data.playerId, bet));

        socket.on("roulette:clearBets", () =>
            this.onClearBets(socket.data.playerId));

        socket.on("roulette:requestState", () => {
            socket.emit("roulette:update", this.getPublicState());
        });
    }
    unregisterListeners(socket) {
        socket.off("roulette:placeBet");
        socket.off("roulette:clearBets");
        socket.off("roulette:requestState");
    }

    start() {
        console.log("roulettegame.start()")
        this.phase = "betting"
        this.betsByPlayer = {};
        this.broadcastRouletteState();
    }
    stop() {
        this.clearTimeouts();
    }

    onPlaceBet(playerId, bet) {
        //säkerhetåtgärder
        if (this.phase !== "betting")
            return;
        if (!playerId)
            return;
        if (!bet || typeof bet.amount !== "number" || bet.amount <= 0)
            return;
        if (bet.type !== "color" && bet.type !== "number")
            return;
        //0 blir grön, cheeky coolare
        if (bet.type === "number" && bet.value === 0) {
            bet = { type: "color", value: "green", amount: bet.amount };
        }

        if (!this.betsByPlayer[playerId]) {
            const player = this.context.players.find((p) => p.id == playerId);
            this.betsByPlayer[playerId] = {
                name: player?.name ?? "Player",
                bets: [],
            };
        }
        const bets = this.betsByPlayer[playerId].bets;
        //slå ihop bets om man lägger samma igen
        const index = bets.findIndex(
            (b) => b.type === bet.type && b.value === bet.value
        );
        if (index !== -1) {
            bets[index].amount += bet.amount;
        }
        else {
            bets.push({ type: bet.type, value: bet.value, amount: bet.amount });
        }
        this.broadcastRouletteState();
    }

    onClearBets(playerId) {
        if (!this.betsByPlayer[playerId])
            return;
        this.betsByPlayer[playerId].bets = [];
        this.broadcastRouletteState();
    }
    getPublicState() {
        return {
            phase: this.phase,
            betsByPlayer: this.betsByPlayer,
        };
    }
    broadcastRouletteState() {
        const state = this.getPublicState();
        this.broadcast("roulette:update", state);

    }
}