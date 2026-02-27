<template>
  <div class="info-content">
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
</template>

<script setup lang="ts"></script>
<style scoped>
.info-content {
  text-align: start;
  font-size: 1.5rem;
}
.howToWin {
  text-align: center;
  color: var(--Points_Info);
  text-shadow: 2px 2px black;
}

.howToWinList {
  color: var(--Points_Info);
  text-shadow: 2px 2px black;
}
.drinkingInfo {
  text-align: center;
  color: var(--Drunkness_Info);
  text-shadow: 2px 2px black;
}

.drinkingInfoList {
  color: var(--Drunkness_Info);
  text-shadow: 2px 2px black;
}
</style>
