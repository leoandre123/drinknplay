<template>
    <div class="pocket" v-bind:style="segmentStyle">
        <div class="pocket-inner" v-bind:style="innerStyle"></div>
    </div>


</template>

<script>
export default{
    name: "RoulettePocket",
    props:{
        number: Number,
        index: Number,
        total: Number,
        radius: Number,
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
               transform: `translate(-50%, -50%) rotate(${this.angle}deg) translateY(-${this.radius}px)`
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
    .pocket{
        position:absolute;
        top:50%;
        left:50%;
        width: 28px;
        height: 24px;
        transform-origin: 50% 50%;
        z-index:3;
    }
    
    .pocket-inner{
        width:90%;
        height: 100%;
        border-radius: 3px;
        border: 2px solid rgb(192, 192, 192);
        box-sizing: border-box;
    }

</style>