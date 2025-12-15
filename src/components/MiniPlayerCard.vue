
<template>
  <div class="mini-card">
    <span class="place">{{ place + 1 }}</span>
    <span class="name">{{ player.name }}</span>
    <span v-if="isWinner" class="winner">WINNER!</span>
    <span class="amount">{{ player.amount ?? "-" }}</span>
  </div>
  <div style="font-size:12px; opacity:0.7;">
  id: {{ player.id }} | winner? {{ isWinner }}
</div>
</template>

<script>

export default {
  name: "MiniPlayerCard",
  props: {
    player: { type: Object, required: true },
    place: { type: Number, required: true },
    isWinner: Boolean
  }
};
</script>

<style scoped>
.mini-card {
  display: grid;
  grid-template-columns: 2rem 1fr 3rem;
  align-items: center;

  padding: 0.4rem 0.6rem;
  width: 14rem;

  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.place {
  font-weight: bold;
  text-align: center;
  color: bisque;
}

.winner{
  position: relative;
  z-index: 9999;
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 800;
  background: gold;
  color: black;
}


.name {
  overflow: hidden;
  color: rgb(183, 131, 232);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score {
  text-align: right;
  font-weight: bold;
}
.amount {
  text-align: right;
  font-size: 10px;
  font-weight: bold;
  color: rgb(209, 156, 233);
}
</style>
