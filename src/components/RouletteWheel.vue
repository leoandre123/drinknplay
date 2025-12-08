<template>
    <div class="roulette-background">
        <div class="roulette-wheel">
            <Roulette v-for="(n,i) in numbers"
            v-bind:key="i"
            :number="n"
            :index="i"
            :total="numbers.length"
            :radius="radius"
           /> 

           <div class="wheel-inner"></div>
        </div>
    </div>
</template>

<script>
import Roulette from './Roulette.vue';

export default{
    name: "RouletteWheel",
    components:{Roulette},
    data(){
        return {
            numbers: 
            [0, 32, 15, 19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26

            ],
            radius: 115

        };
    },
    computed: {
        angleStep(){
            return 360 / this.numbers.length;
        }
    },
    methods:{
        

    }
}
</script>


<style scoped>
    .roulette-background{
        display:flex;
        justify-content: center;
        align-items: center;
    }
    .roulette-wheel{
        position: relative;
        width: 360px;
        height: 360px;
        border-radius: 50%;
        border: 10px solid black;
        background-color: rgb(125, 59, 9);
        box-sizing: border-box;
    }
    .wheel-inner{
        position:absolute;
        top:51%;
        left:50%;
        width:68%;
        height:68%;
        transform: translate(-50%,-50%);
        background-color: rgb(15, 160, 20);
        border-radius: 50%;

    }
    


</style>