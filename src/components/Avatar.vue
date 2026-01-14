<template>
  <div class="avatar-container">
    <div :class="`avatar-part`" :style="bodyStyle"></div>
    <div :class="`avatar-part`" :style="mouthStyle"></div>
    <div :class="`avatar-part`" :style="eyesStyle"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: "Avatar",
  props: ["settings"],
  components: {},
  methods: {},
  computed: {
    bodyStyle() {
      return {
        backgroundImage: `url("/avatar/body/${this.settings.body}.png")`,
      };
    },
    mouthStyle() {
      return {
        backgroundImage: `url("/avatar/mouth/${this.settings.mouth}.png")`,
      };
    },
    eyesStyle() {
      return {
        backgroundImage: `url("/avatar/eyes/${this.settings.eyes}.png")`,
      };
    },
  },
};
</script>

<style scoped>
.avatar-container {
  position: relative;
  height: 100%;
  aspect-ratio: 1;
}
.avatar-part {
  position: absolute;

  width: 100%;
  height: 100%;
  background-size: cover;
  image-rendering: pixelated;
}
</style>
