<template>
  <RouterView />
  <div class="language-switcher">
    <div
      v-if="!context.state?.phase || context.state?.phase == 'lobby'"
      :class="['flag', audioManager.muted || !audioManager.unlocked ? 'muted' : 'audio']"
      @click="audioManager.toggleMute()"
    ></div>
    <div
      v-if="!context.state?.phase || context.state?.phase == 'lobby'"
      @click="switchLang('sv')"
      class="flag swe"
    ></div>
    <div
      v-if="!context.state?.phase || context.state?.phase == 'lobby'"
      @click="switchLang('en')"
      class="flag usa"
    ></div>
  </div>
</template>

<script>
import Flag from "vue-flag-icon/components/icon/Flag.vue";
import { useI18n } from "vue-i18n";
import { RouterView } from "vue-router";
import { audioManager } from "./AudioManager";
import { context } from "./context";

export default {
  name: "App",
  data() {
    return { audioManager, context };
  },
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

.audio {
  background-image: url("/sound.png");
}
.muted {
  background-image: url("/mute.png");
}

.flag:hover {
  transform: scale(1.1);
}

.swe {
  background-image: url("/sweden.png");
}
.usa {
  background-image: url("/usa.png");
}
</style>
