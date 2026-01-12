<template>
    <RetroContainer>
        <div class="layout">
            <div class="left">
               <RetroButton class="rules-button" color="blue" @click="showRules = true">
                {{$t("roulette.howToPlay")}}
               </RetroButton> 
               <RouletteRules v-if="showRules" @close="showRules = false"/>

                <div class="wheel-area">
                    <RouletteWheel
                        ref="wheel"
                        :phase="phase"
                        @spinFinished="onSpinFinished"/>
                    <div class="spin-button">  
                    <RetroButton
                        color="yellow"

                        @click="startSpin"
                        :disabled="phase !== 'betting'">
                        {{ $t("roulette.spin") }}
                    </RetroButton>
                    </div> 
                    <div class="next-round-button">
                    <RetroButton v-if="phase === 'result' && round < maxRounds"
                        color="pink"
                        @click="nextRound"
                        >
                        {{$t("roulette.nextRound")}}
                    </RetroButton>
                    </div>
                    <div class="continue-button" >
                    <RetroButton v-if="phase === 'result' && round >= maxRounds"
                        color="green"
                        @click="nextRound">
                        {{$t("roulette.continue")}}
                    </RetroButton>
                    </div>
                </div>
            </div>
            <div class="right">
                <h2 class="round-info">
                    {{ $t("roulette.round") }} {{ round }}/{{ maxRounds }}
                </h2>
                <div class="top-panels">
                    <div class="bets-area">
                        <h2 class="bets-title"> {{ $t("roulette.bets") }}</h2>

                        <div v-if="betsList.length === 0">{{$t("roulette.noBetsPlaced")}}</div>

                        <div v-else>
                            <div v-for="[playerId, p] in betsList"
                            :key="playerId"
                            class="player-bets">
                                <div class="player-name">{{ p.name }}</div>

                                <ul v-if="p.bets && p.bets.length" class="bet-list">
                                    <li v-for="b in p.bets" :key="`${b.type} - ${b.value}`">
                                        <span v-if="b.type === 'color'">
                                            {{$t("roulette.color")}}: {{ String(b.value).toUpperCase() }} - {{ b.amount }} {{$t("roulette.drinkCredits")}}
                                        </span>
                                        <span v-else>
                                            {{$t("roulette.number")}}: {{ b.value }} - {{ b.amount }} {{$t("roulette.drinkCredits")}}
                                        </span>
                                    </li>
                                </ul>
                                <div v-else>{{$t("roulette.noBets")}}</div>
                            </div>
                        </div>
                    </div>
                    <div class="result-area">
                        <h2 class="result-title">{{$t("roulette.result")}}</h2>
                        <div v-if="phase === 'betting'">
                            {{$t("roulette.waitSpin")}}
                        </div>
                        <div v-else-if="phase === 'spinning'">
                            {{$t("roulette.spinning")}}
                        </div>
                        <div v-else>
                            <div v-if="spinResult">
                                <div>{{$t("roulette.number")}}: {{ spinResult.number }}</div>
                                <div>{{$t("roulette.color")}}: {{ String(spinResult.color).toUpperCase() }}</div>

                                <div>
                                    {{$t("roulette.winners")}}: 
                                    <div v-if="spinResult.winners.length === 0">{{$t("roulette.noWinners")}}</div>
                                    <ul v-else>
                                        <li v-for="w in spinResult.winners" :key="w.playerId">
                                            {{ w.name }} - {{ w.winningAmount }} {{$t("roulette.drinkCredits")}}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            

                <div class="standings">
                    <h2>{{$t("roulette.standings")}}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>{{ $t("roulette.player") }}</th>
                                <th>{{ $t("roulette.amount") }}</th>
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


import RetroContainer from '@/components/RetroContainer.vue';
import RouletteWheel from "@/components/Roulette/RouletteWheel.vue";
import RouletteRules from "@/components/Roulette/RouletteRules.vue";
import RetroButton from "@/components/RetroButton.vue";
import { audioManager } from "@/AudioManager";

export default {
    name: "RouletteView",
    components: {RouletteWheel, RetroContainer, RouletteRules, RetroButton},

    data(){
        return {
            round: 1,
            maxRounds: 3,
            phase: "betting",
            betsByPlayer: {},
            spinResult: null,
            totalPerPlayer: {},
            showRules: false,
            spinAudio: null,
        };
    },
    mounted(){
        
        this.onRouletteUpdate = (state) =>{
            this.round = state?.round ?? 1;
            this.maxRounds = state?.maxRounds ?? 3;
            this.phase = state?.phase ?? "betting";
            this.betsByPlayer = state?.betsByPlayer ?? {};
            this.spinResult = state?.spinResult ?? null;
            this.totalPerPlayer = state?.totalPerPlayer ?? {};
        };
        socket.on("roulette:update", this.onRouletteUpdate);
        socket.emit("roulette:requestState");

        this.spinAudio = new Audio("/sounds/Roulettewheel2.mp3");
        this.spinAudio.preload = "auto";
        this.spinAudio.volume = 0.8;
        this.jazz = audioManager.play("/sounds/Jazz.mp3", {loop: true, volume: 0.5});

     

    },
    beforeUnmount(){
        socket.off("roulette:update", this.onRouletteUpdate);
        this.spinAudio = null;
        audioManager.stopAll();
        
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
        playSpinSound(){
            if(!this.spinAudio)
                return;
            this.spinAudio.currentTime = 0; //kan spelas direkt igen
            this.spinAudio.play();
        },
        startSpin(){
            this.playSpinSound();
            socket.emit("roulette:startSpin");
            this.$refs.wheel.spin(); //spin() från RouletteWheelviewen
        },
        onSpinFinished(number){
         
            socket.emit("roulette:spinResult", { number });
        },
        nextRound(){
            
            socket.emit("roulette:nextRound");
        }
    }
}
</script>
<style scoped>
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
    width: 250px;
    top: -100px;
    letter-spacing: 1px;

}
.next-round-button{
    top: -60px;
    letter-spacing: 0.5px;
    
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
    color: #dd0606;
    font-weight: 700;
     }
.rules-button{
    cursor: pointer;
    position: absolute;
    top: 12px;
    left:12px;
    z-index: 50;
    
}
</style>