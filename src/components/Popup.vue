<template>
  <div v-if="isShowing" class="popup-container" @click.self="hide">
    <div class="popup">
      <h2 class="title">{{ title }}</h2>
      <div class="close-button">
        <RetroButton size="small" color="red" @click="hide">x</RetroButton>
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
}
.popup {
  position: relative;
  max-width: 80%;
  border: 0.25rem solid rgba(250, 250, 250, 0.5);
  background: var(--Trans_Violet_Blue);
  padding: 1.5rem;
}
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
