<template>
  <div class="info-content">
    <ul class="howToWinList">
      <li>{{ $t("lobbyInfo.info1") }}</li>
      <li>{{ $t("lobbyInfo.info2") }}</li>
      <li>{{ $t("lobbyInfo.info3") }}</li>
    </ul>
    <h3 class="drinkingInfo">{{ $t("lobbyInfo.drinking") }}</h3>
    <ul class="drinkingInfoList">
      <li>{{ $t("lobbyInfo.info4") }}</li>
      <li>{{ $t("lobbyInfo.info5") }}</li>
      <li>{{ $t("lobbyInfo.info6") }}</li>
      <li>{{ $t("lobbyInfo.info7") }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts"></script>
<style scoped>
.info-content {
  text-align: start;
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
