

<template>
    <RetroContainer>
        <div class="layout">
            <div class="wheel-area">
                <RouletteWheel/>
            </div>
            <div class="bets-area">
                <h2> Bets ({{ phase }})</h2>

                <div v-if="betsList.length === 0">No bets placed yet!</div>

                <div v-else>
                    <div v-for="[playerId, p] in betsList"
                    :key="playerId"
                    class="player-bets">
                        <div class="player-name">{{ p.name }}</div>

                        <ul v-if="p.bets && p.bets.length" class="bet-list">
                            <li v-for="b in p.bets" :key="`${b.type} - ${b.value}`">
                                <span v-if="b.type === 'color'">
                                    Color: {{ String(b.value).toUpperCase() }} - {{ b.amount }}
                                </span>
                                <span v-else>
                                    Number: {{ b.value }} - {{ b.amount }}
                                </span>
                            </li>
                        </ul>
                        <div v-else>No bets</div>
                    </div>
                </div>
            </div>


        </div>
        
    </RetroContainer>


</template>
<script>

import { socket } from "@/socket";
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
        };
    },
    mounted(){
        this.onRouletteUpdate = (state) =>{
            this.phase = state?.phase ?? "betting";
            this.betsByPlayer = state?.betsByPlayer ?? {};
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
    }
}
</script>
<style>
.layout{
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
    align-items: start;
    color:white;
}

.bets-area{
    padding:12px;
    border: 1px solid rgba(250,250,250,0.3);
    border-radius: 10px;

    grid-column: 2;
    grid-row: 1;
}
.player-bets{
    margin-top:10px;
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
    grid-row:1;
}

</style>