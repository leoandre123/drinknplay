<template>
    <div class="drawing-tools">
        <div class="color-buttons">
            <button v-for="color in this.colors" @click="options.brushColor = color" class="color-button"
                :style="{ backgroundColor: color }"></button>
        </div>
        <div class="brush-size-buttons">
            <button v-for="brushSize in this.brushSize" @click="options.brushSize = brushSize"
                class="brush-size-button">
                <span class="dot" v-bind:style="{ height: brushSize + 'px', width: brushSize + 'px', backgroundColor: options.brushSize == brushSize ? options.brushColor : 'gray' }
                    "></span>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        options: Object,
    },
    data() {
        return {
            brushSize: [10, 25, 50],
            colors: [
                "red",
                "green",
                "blue",
                "yellow",
                "orange",
                "purple",
                "pink",
                "brown",
                "black",
                "white",
                "gray",
                "cyan",]
        };
    },
};
</script>


<style scoped>
.drawing-tools {
    display: flex;
    background-color: gray;
    height: 4rem;
    width: 600px;
    border: 5px outset black;
}

.color-button {
    width: 2rem;
    height: 2rem;
    display: block;
}

.color-buttons {
    margin: 0;
    display: flex;
    width: 200px;
    flex-wrap: wrap;
    gap: 0;

}

.brush-size-buttons {
    margin: 0;
    display: flex;
    width: 200px;
    gap: 0;
}

.brush-size-button {
    position: relative;
    margin: 0;
    display: flex;
    width: 200px;
    flex-wrap: wrap;
    gap: 0;
    align-items: center;
    justify-content: center;
}

.dot {
    background-color: white;
    border-radius: 50%;
    border: 1px solid black;
}
</style>