<template>
  <div class="mascot">
    <div style="position: absolute; left: 0">
      <button @click="peek">Peek</button>
      <button @click="hide">Hide</button>
      <button @click="show">Show</button>
    </div>

    <div class="mascot-character" :style="{ bottom: bottom + '%' }">
      <img v-if="!isAngry" src="@/assets/mascot.png" />
      <img v-if="isAngry" src="@/assets/mascot_creepy.png" />
    </div>
    <div v-if="bottom == 0" class="speech-bubble">
      <p v-if="!isAngry">Are you feeling lucky? Come play</p>
      <p v-if="isAngry">Are you SURE?</p>

      <button @click="isAngry = false">YES</button>
      <button @click="isAngry = true">NO</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Mascot",
  props: {},
  data() {
    return {
      isAngry: false,
      bottom: -60,
    };
  },
  methods: {
    peek() {
      this.animateToPos(-30);
      setTimeout(() => this.animateToPos(-60), 3000);
    },
    show() {
      this.animateToPos(0);
    },
    hide() {
      this.animateToPos(-60);
    },
    animateToPos(pos) {
      const sgn = Math.sign(this.bottom - pos);

      const anim = () => {
        if (Math.abs(this.bottom - pos) < 1) this.bottom = pos;
        if (this.bottom == pos) return;

        this.bottom -= sgn;

        requestAnimationFrame(anim);
      };

      requestAnimationFrame(anim);
    },
  },
};
</script>

<style scoped>
.mascot {
  position: relative;
  min-width: 15rem;
  min-height: 15rem;
  overflow: hidden;
}

.mascot-character {
  position: absolute;
  width: 60%;
  height: 60%;
  bottom: 0;
  left: 0;
}
.mascot-character img {
  width: 100%;
  height: 100%;
}

.speech-bubble {
  position: absolute;
  background-image: url("bubble.png");
  background-size: 100% 100%;
  box-sizing: border-box;
  padding: 1rem;

  width: 60%;
  height: 60%;
  top: 0;
  right: 0;
}
.speech-bubble p {
  margin: 0;
}
</style>
