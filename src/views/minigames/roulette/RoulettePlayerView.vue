
<template>
<RetroContainer>
<div class="whole-page">
    <h1 class="title">Roulette</h1>

    <div class="betting-board">
        <div class="square zero">0</div>

        <div v-for="n in numbers" 
        :key="n" class="square"
        :style="{backgroundColor:color(n)}">
        {{ n }}
    </div>
        
    
        <div class="square bet-red">RED</div>
        <div class="square bet-black">BLACK</div> 
    </div>
</div>


</RetroContainer> 

</template>

<script>
import RetroContainer from '../../../components/RetroContainer.vue';

 const redNumbers = new Set( [
        1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
    ]);

export default{
      name: "RoulettePlayerView",
      components:{RetroContainer},
    

data(){
    return {
        numbers:[
        3,6,9,12,15,18,21,24,27,30,33,36,
        2,5,8,11,14,17,20,23,26,29,32,35,
        1,4,7,10,13,16,19,22,25,28,31,34
       ]
    };
    },
    methods:{
        color(number){
            if (number===0)
                return "rgb(2,112,2)";
            return redNumbers.has(number)
                ? "rgb(172,8,8)"
                : "rgb(0,0,0)";
        }
    }
}


</script>

<style scoped>
.whole-page{
    padding: 16px;
    display: grid;
    place-items: center;
    gap:12px;
}
.title{
    color: rgb(219, 52, 202);
    margin:0;
    font-size: 50px;
    font-family: Arial, Helvetica, sans-serif;
}
.betting-board{
    display: grid;
    grid-template-columns: 70px repeat(12,52px);
    grid-template-rows: repeat(3,52px) 52px;

    gap:3px;
    padding:10px;
    background: rgb(2, 112, 2) ;
    border-radius: 12px;
}

.square{
    border:1px solid rgba(255, 255, 255, 0.65);
    border-radius: 8px;
    display: grid;
    place-items: center;
    color:white;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: bold;
    user-select: none;

}

.zero{
    grid-column:1;
    grid-row:1/span 3;
    background: rgb(2, 112, 2);
    font-weight: bold;
    font-size: 20px;
}

.red{
    background: rgb(172, 8, 8);
}
.black{
    background: black;
}

.bet-red{
    grid-row:4;
    grid-column: 3 / span 4;
    background: rgb(172, 8, 8);
    font-weight: bold;
    letter-spacing: 1px;
    border:3px solid rgba(250, 250, 250,0.75);
}

.bet-black{
    grid-row:4;
    grid-column: 8/ span 4;
    background: black;
    font-weight: bold;
    letter-spacing: 1px;
    border:3px solid rgba(250, 250, 250,0.75);
}

</style>
