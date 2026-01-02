import { Minigame } from "../Minigame.js";

export class RouletteGame extends Minigame {
    constructor() {
        super();
        console.log("Roulette constructor running")
        //lägg tll spin och resultat sen
        this.phase = "betting";

        this.betsByPlayer = {};
        this.spinResult = null;
    }

    onPlayerJoined(player) {
        console.log("player joined")
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
    onHostJoined(socket) {
        this.registerListeners(socket);
        console.log("[SERVER] roulette onHostJoined", socket.id);

        socket.emit("roulette:update", this.getPublicState());
    }
    registerListeners(socket) {
        console.log("[SERVER] roulette registerListeners for", socket.id, "playerId=", socket.data.playerId);

        socket.on("roulette:placeBet", (bet) => {

            console.log("[SERVER] roulette:placeBet", socket.data.playerId, bet);

            this.onPlaceBet(socket.data.playerId, bet);
        });
        socket.on("roulette:clearBets", () => {

            console.log("[SERVER] roulette:clearBets", socket.data.playerId);


            this.onClearBets(socket.data.playerId);
        });
        socket.on("roulette:requestState", () => {
            console.log("[SERVER] roulette:requestState from", socket.id);

            socket.emit("roulette:update", this.getPublicState());
        });

        socket.on("roulette:startSpin", () => {
            console.log("[SERVER] roulette:startSpin from", socket.id, "phase=", this.phase);
            this.onStartSpin();
        });

        socket.on("roulette:spinResult", ({ number }) => {
            console.log("[SERVER] roulette:spinResult payload=", number, "phase=", this.phase);

            this.onSpinResult(number);
        });
        socket.on("roulette:nextRound", () => {
            this.onNextRound();
        })

    }

    unregisterListeners(socket) {
        socket.off("roulette:placeBet");
        socket.off("roulette:clearBets");
        socket.off("roulette:requestState");
        socket.off("roulette:startSpin");
        socket.off("roulette:spinResult");
        socket.off("roulette:nextRound");
    }

    start() {

        this.phase = "betting"
        this.betsByPlayer = {};
        this.spinResult = null;
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
    onStartSpin() {
        if (this.phase !== "betting")
            return;
        this.phase = "spinning";
        this.spinResult = null;

        this.broadcastRouletteState();
    }
    onSpinResult(number) {
        console.log("[SERVER] onSpinResult called", {
            number,
            phase: this.phase,
        });

        if (this.phase !== "spinning") {

            console.warn("[SERVER] spinResult ignored – wrong phase:", this.phase);

            return;
        }
        const color = this.getColor(number);
        const winners = [];

        for (const [playerId, playerData] of Object.entries(this.betsByPlayer)) {
            const bets = playerData?.bets ?? [];
            const winningAmount = bets.reduce((sum, b) => { //reducera listan till ett värde
                if (b.type === "number" && b.value === number)
                    return sum + b.amount * 36;
                if (b.type === "color" && b.value === color)
                    return sum + b.amount;
                return sum;
            }, 0); //börja summan på 0
            if (winningAmount > 0) {
                winners.push({ playerId, name: playerData.name, winningAmount });
            }
        }
        this.spinResult = { number, color, winners };
        this.phase = "result";
        this.broadcastRouletteState();
    }

    getColor(number) {
        if (number === 0)
            return "green";
        const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
        return red.has(number) ? "red" : "black";
    }
    onNextRound() {
        if (this.phase !== "result")
            return;
        for (const playerData of Object.values(this.betsByPlayer)) {
            playerData.bets = [];
        }
        this.spinResult = null;
        this.phase = "betting";
        this.broadcastRouletteState();
    }


    getPublicState() {
        return {
            phase: this.phase,
            betsByPlayer: this.betsByPlayer,
            spinResult: this.spinResult,
        };
    }
    broadcastRouletteState() {
        const state = this.getPublicState();



        this.broadcast("roulette:update", state);
        console.log("roulette update", state);

    }

}