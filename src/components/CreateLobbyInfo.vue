<template>
  <div class="popup-container" @click.self="$emit('close')">
    <div class="pop-up">
      <div class="close-button">
        <RetroButton size="small" color="red" @click="$emit('close')">x</RetroButton>
      </div>

      <div class="content">
        <h3 class="howToWin">{{ $t("createlobbyinfo.h1") }}</h3>
        <ul class="howToWinList">
          <li>{{ $t("createlobbyinfo.p1") }}</li>
          <li>{{ $t("createlobbyinfo.p2") }}</li>
          <li>{{ $t("createlobbyinfo.p3") }}</li>
        </ul>
        <h3 class="drinkingInfo">{{ $t("createlobbyinfo.h2") }}</h3>
        <ul class="drinkingInfoList">
          <li>{{ $t("createlobbyinfo.p4") }}</li>
          <li>{{ $t("createlobbyinfo.p5") }}</li>
          <li>{{ $t("createlobbyinfo.p6") }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import RetroButton from "./RetroButton.vue";

export default {
  components: { RetroButton },
  emits: ["close"],
};
</script>

<style scoped>
.howToWin {
  text-align: center;
  color: var(--Rules_Info);
}
.howToWinList {
  color: var(--Rules_Info);
}
.drinkingInfo {
  text-align: center;
  color: var(--Drunkness_Info);
}

.drinkingInfoList {
  color: var(--Drunkness_Info);
}

.pop-up {
  padding: 1.5rem;
  position: relative;
  border: 0.25rem solid rgba(250, 250, 250, 0.5);
  background: var(--Trans_Violet_Blue);
  font-size: 2rem;
  text-align: start;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
