<template>
    <div class="drawing-canvas">
        <div class="drawing-title">Drink n' Draw</div>
        <drawingCanvas :options="drawingOptions">
        </drawingCanvas>
        <drawingTools :options="drawingOptions">
        </drawingTools>
    </div>
</template>
<script>
import drawingCanvas from '../components/drawingCanvas.vue';
import drawingTools from '../components/drawingTools.vue';


export default {
    components: { drawingCanvas, drawingTools},
    data() {
        return {
            drawingOptions: {
                brushColor: "black",
                brushSize: 10,
                isBucketSelected: false,
            }
        };
    }
};
</script>

<style scoped>
.drawing-canvas {
    position: relative;
    background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 87%);
    display: flex;
    flex-direction: column;
    align-items: center;
    background-repeat: repeat;
}

.drawing-title {
    font-size: 3rem;
    font-family: "Science Gothic", sans-serif;
    color: var(--Metallic_Yellow);
    text-shadow: 3px 3px black;
    border-bottom: 1px solid var(--Metallic_Yellow);
    width: 70%;
    margin-bottom: 1rem;
}
</style>