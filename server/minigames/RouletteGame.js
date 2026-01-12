import { Minigame } from "../Minigame.js";

export class RouletteGame extends Minigame {
    constructor() {
        super();
        this.phase = "betting";

        this.betsByPlayer = {};
        this.spinResult = null;

        this.totalPerPlayer = {};
        this.round = 1;
        this.maxRounds = 3;
    }

    onPlayerJoined(player) {
        console.log("player joined")
        if (this.totalPerPlayer[player.id] == null) {
            this.totalPerPlayer[player.id] = 0;
        }
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
        socket.emit("roulette:update", this.getPublicState());
    }
    registerListeners(socket) {

        socket.on("roulette:placeBet", (bet) => {

            this.onPlaceBet(socket.data.playerId, bet);
        });
        socket.on("roulette:clearBets", () => {


            this.onClearBets(socket.data.playerId);
        });
        socket.on("roulette:requestState", () => {

            socket.emit("roulette:update", this.getPublicState());
        });

        socket.on("roulette:startSpin", () => {
            this.onStartSpin();
        });

        socket.on("roulette:spinResult", ({ number }) => {
            this.onSpinResult(number);
        });
        socket.on("roulette:nextRound", () => {
            this.onNextRound();
        })

    }

    unregisterListeners(socket) {
        socket.removeAllListeners("roulette:placeBet");
        socket.removeAllListeners("roulette:clearBets");
        socket.removeAllListeners("roulette:requestState");
        socket.removeAllListeners("roulette:startSpin");
        socket.removeAllListeners("roulette:spinResult");
        socket.removeAllListeners("roulette:nextRound");
    }

    start() {

        this.phase = "betting"
        this.betsByPlayer = {};
        this.spinResult = null;
        this.round = 1;
        this.totalPerPlayer = {};
        this.maxRounds = 3;
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
            return;
        }
        const color = this.getColor(number);

        this.addRoundResult(number); //ställning
        const winners = [];

        for (const [playerId, playerData] of Object.entries(this.betsByPlayer)) {
            const bets = playerData?.bets ?? [];
            const winningAmount = bets.reduce((sum, b) => { //reducera listan till ett värde
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

    getColor(number) {
        if (number === 0)
            return "green";
        const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
        return red.has(number) ? "red" : "black";
    }
    onNextRound() {
        if (this.phase !== "result")
            return;

        if (this.round >= this.maxRounds) {

            this.broadcastRouletteState();
            this.onFinished?.({
                type: "credits",
                data: Object.entries(this.totalPerPlayer).map(([playerId, total]) => ({
                    playerId: playerId,
                    credits: total,
                }))
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
    addRoundResult(winningNumber) {
        const roundResultPerPlayer = {};

        for (const [playerId, entry] of Object.entries(this.betsByPlayer)) {
            const bets = entry.bets || [];
            let roundResult = 0;

            for (const bet of bets) {
                roundResult += this.getBetNet(bet, winningNumber);
            }
            roundResultPerPlayer[playerId] = roundResult;
            this.totalPerPlayer[playerId] = (this.totalPerPlayer[playerId] ?? 0) + roundResult;
        }
    }
    betWins(bet, winningNumber) {
        if (!bet)
            return false;
        if (bet.type === "number") {
            return bet.value === winningNumber;
        }
        if (bet.type === "color") {
            const winningColor = this.getColor(winningNumber);
            return bet.value === winningColor;
        }
        return false;
    }

    getBetNet(bet, winningNumber) {
        const amount = bet.amount ?? 0;
        if (amount <= 0)
            return 0;
        if (!this.betWins(bet, winningNumber)) {
            return -amount;
        }
        if (bet.type === "number")
            return amount * 36;
        if (bet.type === "color")
            return amount;
        return 0;
    }

    getPublicState() {
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
        this.broadcast("roulette:update", state);
        console.log("roulette update", state);

    }

}