<template>
  <svg view-box="0 0 100 100" fill="none" stroke="black" stroke-width="4">
    <rect x="0" y="0" width="100" height="100" fill="white" stroke="none" />
    <path
      :d="`M 27 ${75 - level * 5} L 30 75 A10 3 0 0 0 70 75 L73 ${75 - level * 5}`"
      fill="orange"
      stroke="none"
    />
    <path d="M 27 25 L 30 75 A10 3 0 0 0 70 75 L73 25" />

    <path d="M 30 85 A15 5 0 0 0 70 85" />
    <ellipse cx="50" cy="25" rx="23" ry="5" />
  </svg>
</template>

<script>
export default {
  name: "DrinkingGlass",
  props: {
    level: Number,
  },

  computed: {},
};
</script>

<style scoped></style>
