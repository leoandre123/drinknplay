<template>
  <div class="picker-container" :style="{ backgroundColor: color }">
    <div class="clickable" tabindex="0" @click="toggle" @blur="isShowing = false"></div>
    <div class="picker">
      <ChromePicker v-if="isShowing" v-model="color" />
    </div>
  </div>
</template>

<script>
import { ChromePicker } from "vue-color";

export default {
  name: "ColorPicker",
  components: { ChromePicker },
  props: {
    modelValue: { type: String, required: true },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      color: this.modelValue,
      isShowing: false,
    };
  },
  methods: {
    toggle() {
      this.isShowing = !this.isShowing;
    },
    updateColor(data) {
      console.log(data);
      this.$emit("update:color", data.hex);
    },
  },
  watch: {
    color(newColor) {
      this.$emit("update:modelValue", newColor);
    },
    modelValue(newColor) {
      this.color = newColor;
    },
  },
};
</script>

<style scoped>
.picker-container {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
}

.clickable {
  width: 100%;
  height: 100%;
}

.picker {
  position: absolute;
  bottom: 2.2rem;
}
</style>
