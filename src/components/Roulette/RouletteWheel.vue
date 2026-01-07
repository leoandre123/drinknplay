<template>
    <div class="roulette-background">
        
        <div class="roulette-wheel" ref="wheel" v-bind:style="{transform:'rotate('+ rotation +'deg)'}">
            <RoulettePocket v-for="(n,i) in numbers"
            v-bind:key="i"
            :number="n"
            :index="i"
            :total="numbers.length"
            :radius="pocketRadius"/>

            <Roulette v-for="(n,i) in numbers"
            v-bind:key="i"
            :number="n"
            :index="i"
            :total="numbers.length"
            :radius="radius"
           /> 
            <div class="wheel-inner-rim"></div>
            <div class="pocket-rim"></div>
            <div class="ball" v-bind:style="{transform: 'translate(-50%,-50%) rotate(' + (ballRotation)+'deg) translateY(-' + ballRadius +'px)'}"></div>
           <div class="wheel-inner"></div>
           <div class="wheel-middle"></div>
           <div class="wheel-inner-middle"></div>
           <div v-for="i in 4" v-bind:key="'stick-'+i" class="wheel-stick"
           v-bind:style="{transform: 'translate(-50%,-50%) rotate('+(i-1) * 90 + 'deg)'}">
            </div>
           <div class="wheel-middle-button"></div>
        </div >
    </div>

</template>

<script>
import Roulette from "@/components/Roulette/Roulette.vue";
import RoulettePocket from "@/components/Roulette/RoulettePocket.vue";

 

export default{
    name: "RouletteWheel",
    components:{Roulette, RoulettePocket},
    data(){
        return {
            numbers: 
            [0, 32, 15, 19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,
            10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26
            ],
            radius: 0,
            rotation: 0,
            ballRotation: 0,
            isSpinning: false,
        };
    },
    
    mounted(){
        this.updateRadius();
        window.addEventListener("resize",this.updateRadius);

    },
    beforeUnmount(){
        window.removeEventListener("resize", this.updateRadius);
    },
    computed:{
        pocketRadius(){
            return this.radius -27;
        },
        ballRadius(){
            return this.pocketRadius;
        }

    },
    methods:{
        updateRadius(){
            const wheel = this.$refs.wheel;
            if(!wheel) return;
            const size = wheel.offsetWidth;
            const centerNumebers = 30;
            
            const outerR = size / 2 - centerNumebers;
            const innerScale = 0.68;
            const innerR = (size * innerScale) / 2;
            this.radius = (outerR + innerR) / 2;
        },
        spin(){
            
           /* if(this.isSpinning) //motverka dubbelklick, blir fler "vinnare" isf
            return;*/
            this.isSpinning = true;
            const randomSpin = Math.floor(Math.random()*360);

            const minExtraSpins = 5 * 360;

            const endRotation = this.rotation + minExtraSpins+randomSpin;

            const ballEndRotation = this.ballRotation - minExtraSpins + randomSpin;

            this.rotation = endRotation;
            this.ballRotation = ballEndRotation;

            setTimeout(()=>{ 
                const finalNumber = this.calculateFinalNumber();
                this.isSpinning = false;
                this.$emit("spinFinished", finalNumber);//säg till RouletteVIew
            },5000); //delayar med 5s
        },
        calculateFinalNumber(){
        const TOTAL = this.numbers.length;
        const DEG = 360 / TOTAL;

         let a = ((this.ballRotation) % 360 + 360) % 360;
         a = (a + DEG / 2 + 360) % 360; //tillbaka halvt fack
        const idx = Math.floor(a / DEG);

        return this.numbers[idx];
        }
    }
}
</script>


<style scoped>
    .roulette-background{
        width: min(80vw,80vh);
        aspect-ratio: 1/1;
        display:flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .roulette-wheel{
        position: relative;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        border: 10px solid rgb(51, 30, 13);
        box-shadow: 0 0 50px rgb(105, 46, 206);
        background-color: rgb(84, 44, 14);
        box-sizing: border-box;
        z-index: 1;
        

        transition: transform 3s cubic-bezier(0.1,0.3,0.1,1);

        
    }
    .wheel-inner-rim{
        position:absolute;
        top:50%;
        left:50%;
        width:87%;
        height:87%;
        transform: translate(-50%,-50%);
        border-radius: 50%;
        border: 9px solid rgb(192, 192, 192);
        z-index:2;
    }
    .pocket-rim{
        position:absolute;
        top:50%;
        left:50%;
        width:72%;
        height:72%;
        transform: translate(-50%,-50%);
        border-radius: 50%;
        border: 3px solid rgb(192, 192, 192);
        z-index:3;
    }
    .wheel-inner{
        position:absolute;
        top:50%;
        left:50%;
        width:59%;
        height:59%;
        transform: translate(-50%,-50%);
        background-color: rgb(84, 44, 14);
        border-radius: 50%;
        border: 3px solid rgb(192, 192, 192);
        z-index:3;
    }
    
    

    button:hover{
        background-color: orange;
    }
    .wheel-middle{
        position:absolute;
        top:50%;
        left:50%;
        width:32%;
        height:32%;
        transform: translate(-50%,-50%);
        background-color: rgb(224, 228, 201);
        border-radius: 50%;
        z-index:4;
    }
    .wheel-inner-middle{
        position:absolute;
        top:50%;
        left:50%;
        width:20%;
        height:20%;
        transform: translate(-50%,-50%);
        background-color: rgb(221, 226, 193);
        border-radius: 50%;
        z-index:5;
        border: 2px solid rgb(207, 181, 59);
    }
    .wheel-middle-button{
        position:absolute;
        top:50%;
        left:50%;
        width:7%;
        height:7%;
        transform: translate(-50%,-50%);
        background-color: rgb(207, 181, 59);
        border-radius: 50%;
        z-index:6;
        border: 1px solid rgb(152, 140, 86);
    }
    .wheel-stick{
        position: absolute;
        top:50%;
        left:50%;
        width: 2%;
        height: 65%;
        background-color: rgb(152, 140, 100);
        border-radius: 9999px;
        border: 1px solid rgb black;
        box-shadow: 0 0 2px rgba(0,0,0,0.5);
        transform-origin: 50% 50%;
        z-index: 4;
    }
    .ball{
        position:absolute;
        top: 50%;
        left: 50%;
        width: 14px;
        height: 14px;
        background: radial-gradient(circle, white 40%, #bbb 70%, #777 100%);
        border-radius: 50%;
        z-index: 7;
        box-shadow: 0 0 4px rgba(0,0,0,0.6);
        transition: transform 5s cubic-bezier(0.2, 0.3, 0.2,1);
    }

</style>