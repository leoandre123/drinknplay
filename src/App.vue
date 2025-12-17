<template>
  <RouterView />
  <div class="language-switcher">
    <div @click="switchLang('sv')" class="flag swe"></div>
    <div @click="switchLang('en')" class="flag usa"></div>
  </div>
</template>

<script>
import Flag from "vue-flag-icon/components/icon/Flag.vue";
import { useI18n } from "vue-i18n";
import { RouterView } from "vue-router";

export default {
  name: "App",
  components: { Flag },
  setup() {
    const { locale } = useI18n();
    function switchLang(lang) {
      locale.value = lang;
    }

    return { switchLang };
  },
};
</script>

<style>
.language-switcher {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  font-size: 4rem;
}

.flag {
  background-size: contain;
  image-rendering: pixelated;
  height: 1em;
  width: 1em;
  cursor: pointer;
}

.flag:hover {
  transform: scale(1.1);
}

.swe {
  background-image: url("sweden.png");
}
.usa {
  background-image: url("usa.png");
}
</style>
