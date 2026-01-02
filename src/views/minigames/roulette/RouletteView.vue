

<template>
    <RetroContainer>
        <div class="layout">
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
            </div>
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
                    <button @click="nextRound">Next round</button>
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
            phase: "betting",
            betsByPlayer: {},
            spinResult: null,
        };
    },
    mounted(){
        
        this.onRouletteUpdate = (state) =>{
            console.log("frontend roulette:update recieved", state);
            this.phase = state?.phase ?? "betting";
            this.betsByPlayer = state?.betsByPlayer ?? {};
            this.spinResult = state?.spinResult ?? null;
        };
        socket.on("roulette:update", this.onRouletteUpdate);
        socket.emit("roulette:requestState");

     

    },
    beforeUnmount(){
        socket.off("roulette:update", this.onRouletteUpdate);
    },
    computed:{

        betsList(){
            return Object.entries(this.betsByPlayer);
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
    grid-template-columns: 1fr 250px 250px;
    gap: 10px;
    align-items: start;
    color:white;
    height: 100%;
    min-width: 0;
}

.player-bets{
    padding-top:10px;
    border-top:10px;

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
    grid-column: 1;
  
}
.bets-area{
    padding:5px;
    border: 1px solid rgba(238, 14, 227, 0.9);
    border-radius: 10px;

    position: sticky;
    top: 150px;
    right: 500px;
    overflow: auto;
    grid-column: 2;
}
.bets-title{
    font-size: 40px;
    margin: 0;
    text-align: center;
}
.result-area{
    padding:5px;
    border: 1px solid rgba(238, 14, 227, 0.9);
    border-radius: 10px;

    position: sticky;
    top: 150px;
    right: 50px;
    overflow: auto;
    grid-column: 3;
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
@media (max-width: 1050px){
  .layout{
    grid-template-columns: 1fr 150px 150px;
    
  }

  .bets-area,
  .result-area{
    position: static;
  }
}

</style>