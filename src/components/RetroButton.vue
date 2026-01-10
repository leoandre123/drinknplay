<template>
  <div>
    <button class="pixel-btn" :class="color" :disabled="disabled" @click="$emit('click')">
      <slot></slot>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    color: String,
    disabled: {type: Boolean, default: false},
  },
  emits: ["click"],

  methods: {
    onClick(e){
      if (this.disabled)
        return;
      this.$emit("click", e);
    }
  }
};
</script>

<style scoped>
.pixel-btn {
  font-family: "Jersey 25", Helvetica, Arial, sans-serif;
  font-size: 2rem;
  padding: 1rem 2rem;
  cursor: pointer;
  text-transform: uppercase;

  /* removes smoothing */
  image-rendering: pixelated;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;

  /* pixel box */
  border: 0;
  position: relative;
  color: white;
  box-shadow:
    /* pixel black outline */ -4px 0 0 0 #000, 4px 0 0 0 #000, 0 -4px 0 0 #000,
    0 4px 0 0 #000, /* extra corner pixels */ -4px -4px 0 0 #000, 4px -4px 0 0 #000,
    -4px 4px 0 0 #000, 4px 4px 0 0 #000, /* drop shadow */ 4px 6px 0 0 #000;
}

/* COLORS — pure flat pixel palette */
.blue {
  background: #61b4ff;
}
.pink {
  background: #ff7bbf;
}
.yellow {
  background: #ffcf67;
}
.purple {
  background: #b48cff;
}
.green{
  background: #08ad29;
}

/* pixel highlight bars */
.pixel-btn::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 6px;
  width: 60%;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  image-rendering: pixelated;
}

/* press effect */
.pixel-btn:active {
  top: 2px;
  box-shadow: -4px 0 0 0 #000, 4px 0 0 0 #000, 0 -4px 0 0 #000, 0 4px 0 0 #000, -4px -4px 0 0 #000,
    4px -4px 0 0 #000, -4px 4px 0 0 #000, 4px 4px 0 0 #000, 4px 4px 0 0 #000;
}

.pixel-btn:disabled{
  opacity: 0.5;
  cursor: not-allowed;
  
}

.pixel-btn:disabled:active{
  top: 0;
  box-shadow:
    -4px 0 0 0 #000, 4px 0 0 0 #000, 0 -4px 0 0 #000, 0 4px 0 0 #000,
    -4px -4px 0 0 #000, 4px -4px 0 0 #000, -4px 4px 0 0 #000, 4px 4px 0 0 #000,
    4px 6px 0 0 #000;
}
</style>
