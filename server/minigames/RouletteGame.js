import { Minigame } from "../Minigame.js";

export class KahootGame extends Minigame {
    constructor() {
        super();
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
        socket.on("roulette:clearBets", () =>
            this.onClearBets(socket.data.playerID));
    }
    unregisterListeners(socket) {
        socket.off("roulette:placeBet");
        socket.off("roulette:clearBets");
    }

    start() {
        this.phase = "betting"
        this.betsByPlayer = {};
        this.broadcastHosts("roulette:update", this.getPublicState());
    }
    stop() {
        this.clearTimeouts();
    }

    onPlaceBet(playerID, bet) {
        //säkerhetåtgärder
        if (this.phase !== "betting")
            return;
        if (!playerID)
            return;
        if (!bet || typeof bet.amount !== "number" || bet.amount <= 0)
            return;
        if (bet.type !== "color" && bet.type !== "number")
            return;
        //0 blir grön, cheeky coolare
        if (bet.type === "number" && bet.value === 0) {
            bet = { type: "color", value: "green", amount: bet.amount };
        }

        if (!this.betsByPlayer[playerID]) {
            const player = this.context.player.find((p) => p.id == playerId);
            this.betsByPlayer[playerID] = {
                name: player?.name == "Player",
                bets: [],
            };
        }
        const bets = this.betsByPlayer[playerID].bets;
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

    onClearBets(playerID) {
        if (!this.betsByPlayer[playerID])
            return;
        this.betsByPlayer[playerID].bets = [];
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
        this.broadcastHosts("roulette:update", state);

    }
}