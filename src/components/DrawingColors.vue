<template>
  <div class="color-buttons" :class="{ row: direction == 'row', col: direction == 'column' }">
    <button
      v-for="color in this.colors"
      @click="options.brushColor = color"
      class="color-button"
      :style="{ backgroundColor: `rgba(${color.r},${color.g},${color.b},${color.a})` }"
    ></button>
  </div>
</template>

<script>
export default {
  props: {
    options: Object,
    direction: String,
  },
  data() {
    return {
      colors: [
        { name: "black", r: 0, g: 0, b: 0, a: 255 },
        { name: "white", r: 255, g: 255, b: 255, a: 255 },
        { name: "red", r: 255, g: 0, b: 0, a: 255 },
        { name: "green", r: 0, g: 128, b: 0, a: 255 },
        { name: "blue", r: 0, g: 0, b: 255, a: 255 },
        { name: "yellow", r: 255, g: 255, b: 0, a: 255 },
        { name: "cyan", r: 0, g: 255, b: 255, a: 255 },
        { name: "magenta", r: 255, g: 0, b: 255, a: 255 },
        { name: "gray", r: 128, g: 128, b: 128, a: 255 },
        { name: "orange", r: 255, g: 165, b: 0, a: 255 },
        { name: "purple", r: 128, g: 0, b: 128, a: 255 },
        { name: "brown", r: 165, g: 42, b: 42, a: 255 },
        { name: "pink", r: 255, g: 192, b: 203, a: 255 },
        { name: "lime", r: 0, g: 255, b: 0, a: 255 },
        { name: "teal", r: 0, g: 128, b: 128, a: 255 },
        { name: "navy", r: 0, g: 0, b: 128, a: 255 },
        { name: "gold", r: 255, g: 215, b: 0, a: 255 },
        { name: "silver", r: 192, g: 192, b: 192, a: 255 },
        //{ name: "maroon", r: 128, g: 0, b: 0, a: 255 },
        //{ name: "olive", r: 128, g: 128, b: 0, a: 255 },
      ],
    };
  },
};
</script>

<style scoped>
.color-button {
  width: 2rem;
  height: 2rem;
  display: block;
}

.color-buttons {
  display: grid;
}

.row {
  grid-template-columns: repeat(9, 1fr);
}

.col {
  grid-template-columns: repeat(3, 1fr);
}
</style>
