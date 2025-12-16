
<template>
  <div class="mini-card">
    <span class="place">{{ place + 1 }}</span>
    <span class="name">{{ player.name }}</span>
    <span class="amount">{{ player.amount ?? "-" }}</span>
  </div>
</template>

<script>

export default {
  name: "MiniPlayerCard",
  props: {
    player: { type: Object, required: true },
    place: { type: Number, required: true }
    }
};
</script>

<style scoped>
.mini-card {
  display: grid;
  grid-template-columns: 2rem 1fr 3rem;
  align-items: center;
  padding: 0.4rem 0.6rem;
  width: 13rem;
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

.name {
  overflow: hidden;
  color: rgb(183, 131, 232);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.amount {
  text-align: right;
  font-size: 10px;
  font-weight: bold;
  color: rgb(209, 156, 233);
}
</style>
