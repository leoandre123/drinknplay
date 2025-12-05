<template>
  <div style="width: 100vw; height: 100vh; background-color: beige">
    <div class="blackjack-container">
      <PlayingCard v-for="rank in 13" :rank="rank" suit="hearts" />
      <PlayingCard v-for="rank in 13" :rank="rank" suit="clubs" />
      <PlayingCard v-for="rank in 13" :rank="rank" suit="diamonds" />
      <PlayingCard v-for="rank in 13" :rank="rank" suit="spades" />
    </div>
    <div></div>
  </div>
</template>

<script>
import PlayingCard from "../../../components/PlayingCard.vue";
import { context } from "../../../context";
import { socket } from "../../../socket";

export default {
  name: "Black",

  data() {
    return {};
  },
  components: { PlayingCard },
  mounted() {},
  beforeUnmount() {},
  methods: {},
};
</script>

<style scoped>
.blackjack-container {
  padding: 1rem;
  gap: 1rem;
  display: grid;
  grid-template-columns: repeat(13, 1fr);
}

.playing-card {
  transition: transform 1s;
  transform: rotateZ(0deg);
}

.playing-card:hover {
  transform: rotateZ(360deg);
}
</style>
