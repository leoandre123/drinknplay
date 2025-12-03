<template>
    <div class="tools-container">
        <div class="color-container">
            <div v-for="color in colors" :style="{backgroundColor: color}" @click="setColor(color)" class="color" :class="{'border':props.mode.color == color}"></div>
        </div>
        |
        <div class="thickness-container">
            <div v-for="size in sizes" @click="setSize(size)" class="tool-button" :class="{'selected':props.mode.size == size}">
                <div :style="{width: `${size}px`, height: `${size}px`}"></div>
            </div>
        </div>
        |
        <div class="tool-button" :class="{'selected':props.mode.mode == 'brush'}"  @click="setMode('brush')"><i class="fas fa-paintbrush"></i></div>
        <div class="tool-button" :class="{'selected':props.mode.mode == 'bucket'}" @click="setMode('bucket')"><i class="fas fa-bucket"></i></div>
        <div class="tool-button" :class="{'selected':props.mode.mode == 'eraser'}" @click="setMode('eraser')"><i class="fas fa-eraser"></i></div>
        |
        <div class="tool-button" @click="$emit('clear')"><i class="fas fa-trash"></i></div>
    </div>
</template>

<script setup>

const props = defineProps({
  mode: Object,
});

defineEmits(['clear']);

const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000']
const sizes = [2, 5, 10, 15]

function setColor(color) {
  props.mode.color = color;
}
function setSize(size) {
  props.mode.size = size;
}
function setMode(mode) {
  props.mode.mode = mode;
}
</script>

<style scoped>

.tools-container{
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: antiquewhite;
    border-radius: 1rem;
}

.tool-button{
    background-color: gray;
    place-items: center;
    place-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 20%; 
    cursor: pointer;
}
.tool-button:hover{
    background-color: gold;
}
.selected{
    background-color: orange;
}


.color-container{
    display: grid;
    grid-template-columns: repeat(11, auto);
    gap: 0.2rem;
}

.color{
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    width: 1rem;
    height: 1rem;
    border-radius: 25%;
    cursor: pointer;
}
.border{
    border: 2px solid red;
}
.thickness-container{
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.thickness-container div div{
    background-color: black;
    align-items: center;
    border-radius: 50%; 
    
}



</style>