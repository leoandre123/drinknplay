<template>
    <canvas ref="myCanvas" width="300px" height="150">
    </canvas>
    <button @click="drawCirkel">Draw a cirkel</button>
</template>

<script>
import { onMounted } from 'vue';
import drawingTools from './drawingTools.vue';

export default {
    components: {
        drawingTools
    },
    data() {
        return {
            hej: 2,
            painting: false
        };
    },
    methods: {
        startPosition() {
            painting = true;
        },
        finishedPosition() {
            painting = false;
        },
        onMounted
    }
};
</script>


<style scoped>
canvas {
    border: 2px inset black;
}
</style>