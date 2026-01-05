

<template>
    <RetroContainer>
        <div class="layout">
            <div class="left">
                <div class="wheel-area">

                    <RouletteWheel
                    ref="wheel"
                    :phase="phase"
                    @spinFinished="onSpinFinished"/>
                    <button
                    class="spin-button"
                    @click="startSpin"
                    :disabled="phase !== 'betting'">
                    Spin
                </button>
                <button class="next-round-button" @click="nextRound"
                :disabled="round >= maxRounds && phase === 'result'">
                Next round
                </button>
                </div>
            </div>
            <div class="right">
                <h2 class="round-info">
                    Round {{ round }}/{{ maxRounds }}
                </h2>
                <div class="top-panels">
                    <div class="bets-area">
                        <h2 class="bets-title"> Bets</h2>

                        <div v-if="betsList.length === 0">No bets placed yet!</div>

                        <div v-else>
                            <div v-for="[playerId, p] in betsList"
                            :key="playerId"
                            class="player-bets">
                                <div class="player-name">{{ p.name }}</div>

                                <ul v-if="p.bets && p.bets.length" class="bet-list">
                                    <li v-for="b in p.bets" :key="`${b.type} - ${b.value}`">
                                        <span v-if="b.type === 'color'">
                                            Color: {{ String(b.value).toUpperCase() }} - {{ b.amount }} sips
                                        </span>
                                        <span v-else>
                                            Number: {{ b.value }} - {{ b.amount }} sips
                                        </span>
                                    </li>
                                </ul>
                                <div v-else>No bets</div>
                            </div>
                        </div>
                    </div>
                    <div class="result-area">
                        <h2 class="result-title">Result</h2>
                        <div v-if="phase === 'betting'">
                            Waiting for spin...
                        </div>
                        <div v-else-if="phase === 'spinning'">
                            Spinning...
                        </div>
                        <div v-else>
                            <div v-if="spinResult">
                                <div>Number: {{ spinResult.number }}</div>
                                <div>Color: {{ String(spinResult.color).toUpperCase() }}</div>

                                <div>
                                    Winners: 
                                    <div v-if="spinResult.winners.length === 0">No winners</div>
                                    <ul v-else>
                                        <li v-for="w in spinResult.winners" :key="w.playerId">
                                            {{ w.name }} - {{ w.winningAmount }} sips
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            

                <div class="standings">
                    <h2>Standings</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in standingsTable" :key="row.playerId">
                                <td>{{ row.name }}</td>
                                <td :class="{pos: row.total > 0, neg: row.total < 0}">
                                    {{ row.total }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
    </RetroContainer>


</template>
<script>


import { socket } from "../../../socket";
import { context } from "@/context";

import RetroContainer from '@/components/RetroContainer.vue';
import RouletteWheel from '@/components/RouletteWheel.vue';

export default {
    name: "RouletteView",
    components: {RouletteWheel, RetroContainer},

    data(){
        return {
            round: 1,
            maxRounds: 3,
            phase: "betting",
            betsByPlayer: {},
            spinResult: null,
            totalPerPlayer: {},
        };
    },
    mounted(){
        
        this.onRouletteUpdate = (state) =>{
            console.log("frontend roulette:update recieved", state);
            this.round = state?.round ?? 1;
            this.maxRounds = state?.maxRounds ?? 3;
            this.phase = state?.phase ?? "betting";
            this.betsByPlayer = state?.betsByPlayer ?? {};
            this.spinResult = state?.spinResult ?? null;
            this.totalPerPlayer = state?.totalPerPlayer ?? {};
        };
        socket.on("roulette:update", this.onRouletteUpdate);
        socket.emit("roulette:requestState");

     

    },
    beforeUnmount(){
        socket.off("roulette:update", this.onRouletteUpdate);
    },
    computed:{

        betsList(){
            return Object.entries(this.betsByPlayer ?? {});
        },
        standingsTable(){
            const betsByPlayer = (this.betsByPlayer ?? {});
            const totals = this.totalPerPlayer ?? {};
            const rows = Object.entries(betsByPlayer).map(([playerId, p])=>({
                playerId,
                name: p?.name ?? playerId,
                total: totals[playerId] ?? 0,
            }));
            rows.sort((a,b)=> b.total - a.total);
            return rows;
        }
    },
    methods:{
        startSpin(){
            socket.emit("roulette:startSpin");
            console.log("startSpin clicked  phase =",this.phase);
            this.$refs.wheel.spin(); //spin() från RouletteWheelviewen
        },
        onSpinFinished(number){
            console.log("spin finished listened number=", number, "phase=", this.phase);
            socket.emit("roulette:spinResult", { number });
        },
        nextRound(){
            socket.emit("roulette:nextRound");
        }
    }
}
</script>
<style>
.layout{
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 20px;
    align-items: start;
    color: white;
}
.left{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.right{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 70px;
}
.top-panels{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    top: 100px;
}
.player-name{
    font-weight: bold;
}
.bet-list{
    margin:6px 0 0 0;
    padding-left: 15px;
}
@media (max-width: 700px){

  .wheel-area{ transform: scale(0.9); }
}
.wheel-area{
    display: flex;
    flex-direction: column;
    align-items: center;

}
.next-round-button{
    margin-top: 20px;
}
.bets-area,
.result-area,
.standings-area {
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 14px;
}
.bets-title{
    font-size: 40px;
    margin: 0;
    text-align: center;
}

.result-title{
    font-size: 40px;
    margin: 0;
    text-align: center;
}

.spin-button{
        font-family: "Science Gothic", sans-serif;
        padding: 12px;
        margin: 15px;
        height: 60px;
        width: 200px;
        border-radius: 10px;
        background-color: var(--French_Rose);
        border: 3px, groove, var(--Caribbean_Green);
        box-shadow: 0 0 .2rem #fff,
        0 0 .2rem #fff,
        0 0 2rem var(--Caribbean_Green),
        0 0 0.8rem var(--Caribbean_Green),
        0 0 2.8rem var(--Caribbean_Green),
        inset 0 0 1.3rem var(--Caribbean_Green);
    }

.standings table { 
    width: 100%;
    border-collapse: collapse; }
.standings th, .standings td { 
    padding: 8px 10px; 
    border-bottom: 1px solid rgba(255,255,255,0.15);
 }
.pos {
    color: rgb(5, 155, 30);
    font-weight: 700; }
.neg { 
    color: rgb(221, 6, 6);
    font-weight: 700;
     }
</style>