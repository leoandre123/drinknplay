<template>
    <div class="segment" :style="segmentStyle">
        <div class="segment-inner" :style="innerStyle">
            {{ number }}
        </div>
    </div>

</template>
<script>
export default {
    name:"Roulette",
    props:{
        number: Number,
        index: Number,
        total: Number,
        radius: Number
    },
    computed:{
        angleStep(){
            return 360 / this.total;
        },
        angle(){
            return this.index * this.angleStep;
        },
        segmentStyle(){
            return {

                
               transform:
          "rotate(" +
          this.angle +
          "deg) translateY(-" +
          this.radius +
          "px)"
            };
        },
        innerStyle(){
            return{
                backgroundColor: this.color,
               
            };
        },
        color(){
            if (this.number===0) return "rgb(0,128,0)";
            const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18,
        19, 21, 23, 25, 27, 30, 32, 34, 36
            ]);
            return red.has(this.number)
            ? "rgb(220,53,69)"
            : "rgb(10,10,10)";
        }
    }
}

</script>

<style scoped>
.segment{
    position:absolute;
    top:39%;
    left:46%;
    width: 27px;
    height: 40px;
    transform-origin: 50% 100%;
}

.segment-inner{
    width: 100%;
    height: 100%;
    border-radius: 5px;
    border: 2px solid black;
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

}

</style>