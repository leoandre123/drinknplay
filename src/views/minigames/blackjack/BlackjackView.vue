<template>
  <div style="width: 100vh; height: 100vh; background-color: aqua">
    <div class="blackjack-container">
      <PlayingCard :rank="5" suit="hearts" />
      <PlayingCard :rank="6" suit="hearts" />
      <PlayingCard :rank="7" suit="hearts" />
      <PlayingCard :rank="8" suit="hearts" />
    </div>
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
  display: flex;
}
</style>
