<template>
  <div v-if="isShowing" class="popup-container" @click.self="!noClose && hide()">
    <div class="popup">
      <h2 class="title">{{ title }}</h2>
      <div class="close-button">
        <RetroButton v-if="!noClose" size="small" color="red" @click="hide">x</RetroButton>
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script>
import RetroButton from "./RetroButton.vue";
export default {
  components: { RetroButton },
  emits: ["close"],
  props: {
    title: String,
    noClose: Boolean,
  },
  data() {
    return { isShowing: false };
  },
  methods: {
    show() {
      this.isShowing = true;
    },
    hide() {
      this.isShowing = false;
    },
  },
};
</script>

<style scoped>
.title {
  text-align: center;
  width: 80%;
  font-size: 2.5rem;
  border-bottom: 0.2rem solid white;
}
.popup {
  position: relative;
  min-width: 15%;
  max-width: 80%;
  border: 0.25rem solid rgba(250, 250, 250, 0.5);
  background: var(--Trans_Violet_Blue);
  padding: 1.5rem;
  justify-items: center;
}
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
