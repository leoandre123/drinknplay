<template>
  <div class="drawing-tools">
    <div class="button-group" :class="{ row: direction == 'row', col: direction == 'column' }">
      <button
        v-for="brushSize in this.brushSize"
        @click="options.brushSize = brushSize"
        :style="{
          backgroundColor: options.brushSize == brushSize ? '#ff8181' : 'gray',
        }"
        class="button"
      >
        <div
          class="dot"
          :style="{
            height: brushSize + 'px',
            width: brushSize + 'px',
            backgroundColor:
              options.brushSize == brushSize
                ? `rgba(${options.brushColor.r},${options.brushColor.g},${options.brushColor.b},${options.brushColor.a})`
                : 'gray',
          }"
        ></div>
      </button>
    </div>

    <div class="button-group" :class="{ row: direction == 'row', col: direction == 'column' }">
      <button
        v-for="mode in ['pen', 'bucket', 'eraser']"
        @click="options.mode = mode"
        class="button"
        :style="{ backgroundColor: options.mode == mode ? '#ff8181' : 'gray' }"
      >
        <img :src="`${mode}.png`" />
      </button>
      <button class="button" @click="saveRequest">Save</button>
      <button class="button" @click="clearRequest">Clear</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    direction: String,
    options: Object,
  },
  emits: ["save-requested", "clearRequested"],
  data() {
    return {
      brushSize: [2, 10, 15, 25, 50],
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
        { name: "maroon", r: 128, g: 0, b: 0, a: 255 },
        { name: "olive", r: 128, g: 128, b: 0, a: 255 },
      ],
    };
  },
  methods: {
    saveRequest() {
      this.$emit("save-requested");
      console.log("Child component emitted save-requested event.");
    },
    clearRequest() {
      this.$emit("clearRequested");
      console.log("Child component emitted save-requested event.");
    },
  },
};
</script>

<style scoped>
.drawing-tools {
  display: flex;
}

.button-group {
  margin: 0;
  display: flex;
  gap: 0;
}

.button {
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-items: center;
}

.dot {
  background-color: white;
  border-radius: 50%;
  border: 1px solid black;
}

.button img {
  width: 2rem;
  height: 2rem;
}

.row {
  flex-direction: row;
}

.col {
  flex-direction: column;
}
</style>
