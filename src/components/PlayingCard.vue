<template>
  <div class="playing-card">
    <svg viewBox="0 0 150 200">
      <!--<rect x="0" y="0" width="150" height="200" rx="8" fill="white" />-->
      <text
        x="10"
        y="10"
        font-family="Comic Sans MS"
        font-size="25"
        font-weight="bold"
        alignment-baseline="hanging"
        :fill="color"
      >
        {{ rankText }}
      </text>
      <text
        x="140"
        y="190"
        font-family="Comic Sans MS"
        font-size="25"
        font-weight="bold"
        text-anchor="end"
        :fill="color"
      >
        {{ rankText }}
      </text>

      <path
        v-if="suit == 'clubs'"
        :fill="color"
        d="M 75 100 m 3 4 c 1.2 2 4.2 5 7.2 5 c 5.4 0 7.8 -4 7.8 -9 c 0 -5 -2.4 -9.5 -7.8 -9.5 c -3 0 -4.8 2.5 -6.6 4 c -0.6 0.5 -1.2 0 -0.6 -0.5 c 1.8 -1.5 4.8 -5.5 4.8 -9 c 0 -4 -3 -9 -7.8 -9 c -4.8 0 -7.8 5 -7.8 9 c 0 3.5 3 7.5 4.8 9 c 0.6 0.5 0 1 -0.6 0.5 c -1.8 -1.5 -3.6 -4 -6.6 -4 c -5.4 0 -7.8 4.5 -7.8 9.5 c 0 5 2.4 9 7.8 9 c 3 0 6 -3 7.2 -5 c 0.6 -0.5 0.6 0 0.6 0.5 c -0.6 4 -0.6 5 -1.2 8 c -0.6 3 -2.4 8.5 -2.4 8.5 c 3 -1 9 -1 12 0 c 0 0 -1.8 -5.5 -2.4 -8.5 c -0.6 -3 -0.6 -4 -1.2 -8 c 0 -0.5 0 -1 0.6 -0.5 z"
      />
      <path
        v-if="suit == 'hearts'"
        :fill="color"
        d="M 75 100 m -0.6 -12.5 c 0 -5.5228 -3.4294 -9 -8.4 -9 c -4.9706 0 -9 4.4772 -9 10 c 0.0209 0.4778 0.0109 0.9456 0 1.4063 c 0 3.6492 1.6061 7.1884 3 10.5 c 1.4334 3.4055 3.5001 6.3903 5.4375 9.4375 c 3.0007 4.7197 9.5625 13.6563 9.5625 13.6563 c 0 0 6.5618 -8.9366 9.5625 -13.6563 c 1.9374 -3.0472 4.0041 -6.032 5.4375 -9.4375 c 1.3939 -3.3116 3 -6.8508 3 -10.5 c -0.017 -0.4872 -0.0112 -0.9573 0 -1.4063 c 0 -5.5228 -4.0294 -10 -9 -10 c -4.9706 0 -8.4 3.4772 -8.4 9 c 0 1 -1.2 1 -1.2 0 z"
      />
      <path
        v-if="suit == 'diamonds'"
        :fill="color"
        d="M 75 100 m 0 -22.5 c 0 0 3 7.5 6.5 12.5 c 3.5 5 8.5 10 8.5 10 c 0 0 -5 5 -8.5 10 c -3.5 5 -6.5 12.5 -6.5 12.5 c 0 0 -3 -7.5 -6.5 -12.5 c -3.5 -5 -8.5 -10 -8.5 -10 c 0 0 5 -5 8.5 -10 c 3.5 -5 6.5 -12.5 6.5 -12.5"
      />
      <path
        v-if="suit == 'spades'"
        :fill="color"
        d="M 75 100 m 3 5 c 0.6 2 3 7 7.2 7 c 5.4 0 7.8 -4 7.8 -9 c 0 -3.5 -1.5474 -5.8061 -3 -8.5 c -1.5467 -2.8684 -3.8276 -5.4287 -6 -8 c -2.7871 -3.299 -9 -9.5 -9 -9.5 c 0 0 -6.2128 6.2011 -9 9.5 c -2.1724 2.5713 -4.4533 5.1316 -6 8 c -1.4526 2.6939 -3 5 -3 8.5 c 0 5 2.4 9 7.8 9 c 4.2 0 6.6 -5 7.2 -7 c 0.6 -0.5 0.6 0 0.6 0.5 c -0.6 4 -0.6 5 -1.2 8 c -0.6 3 -2.4 8.5 -2.4 8.5 c 3 -1 9 -1 12 0 c 0 0 -1.8 -5.5 -2.4 -8.5 c -0.6 -3 -0.6 -4 -1.2 -8 c 0 -0.5 0 -1 0.6 -0.5 z"
      />
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
    color() {
      return this.suit == "diamonds" || this.suit == "hearts" ? "red" : "black";
    },
    rankText() {
      switch (this.rank) {
        case 1:
          return "A";
        case 11:
          return "J";
        case 12:
          return "Q";
        case 13:
          return "K";
        default:
          return `${this.rank}`;
      }
    },
  },
};
</script>

<style scoped>
.playing-card {
  background-color: white;
  width: 6em;
  border-radius: 0.25rem;
  box-shadow: 0px 0px 10px 0px black;
}
</style>
