<template>
  <div class="playing-card">
    <svg width="150" height="200" view-box="0 0 150 200">
      <rect x="0" y="0" width="150" height="200" rx="2" fill="white" />
      <text x="0" y="0" fill="red">{{ rank }}</text>
      <text x="150" y="200" text-anchor="end" fill="red">{{ rank }}</text>
    </svg>
  </div>
</template>

<script>
export default {
  name: "PlayingCard",
  props: {
    rank: Number,
    suit: String,
  },
  computed: {
    suitPositions() {
      return Array.from({ length: this.rank }, (_, i) => {
        i;
      });
    },
  },
};
</script>

<style scoped>
.playing-card {
  width: 7rem;
  height: 10rem;
}
svg {
  width: 100%;
  height: 100%;
}
.rank {
  font-size: large;
  margin: 0;
  position: absolute;
}
.top {
  top: 0;
  left: 0;
}
.bottom {
  bottom: 0;
  right: 0;
}
.suit {
  width: 1rem;
  height: 1rem;
  background-image: url("https://upload.wikimedia.org/wikipedia/commons/a/a0/Naipe_copas.png");
  background-size: cover;
  position: absolute;
}
</style>
