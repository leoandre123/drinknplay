<template>
  <NewRetroContainer>
    <div v-if="context.isHost" class="slot-container">
      <SlotMachine
        ref="slotRef"
        :symbols="availableGames.map((x) => x.symbol)"
        :title="$t('common.spin.title')"
        :text="text"
        @spin-finished="onSpinFinished"
      />
    </div>
    <div v-if="!context.isHost" class="slot">{{ $t("common.slotMessage") }}</div>
  </NewRetroContainer>
</template>

<script>
import { socket } from "../../socket.js";
import { context } from "../../context.js";
import { audioManager } from "@/AudioManager";
import gameinfo from "@/assets/gameinfo.json";
import SlotMachine from "./SlotMachine.vue";
import NewRetroContainer from "@/shared/components/UI/NewRetroContainer.vue";

export default {
  name: "SlotView",

  data() {
    return {
      context,
      gameinfo,
      text: this.$t("common.spin.spin"),
    };
  },
  components: { SlotMachine, NewRetroContainer },
  computed: {
    availableGames() {
      return this.gameinfo.map((game, index) => {
        return {
          name: this.$t(`games[${index}].title`),
          symbol: game.symbol || "❓",
        };
      });
    },
  },
  mounted() {
    socket.on("startSpin", this.onStartSpin);
  },
  beforeUnmount() {
    socket.off("startSpin", this.onStartSpin);
  },
  methods: {
    spinWheel() {
      socket.emit("startSpin");
    },
    advance() {
      socket.emit("advancePhase");
    },
    onStartSpin(symbolIndex) {
      console.log(`Spinning to ${symbolIndex}`);
      this.text = this.$t("common.spin.spinning");
      this.$refs.slotRef.spin(symbolIndex % this.availableGames.length);
      audioManager.play("/sounds/slot.mp3");
    },
    onSpinFinished(symbolIndex) {
      console.log(`Spinning finished on ${symbolIndex}`);
      const gameName = this.availableGames[symbolIndex].name;
      this.text = `${gameName}!!!!`;
    },
  },
};
</script>

<style scoped>
.slot-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.slot {
  font-size: 4vw;
}
</style>
