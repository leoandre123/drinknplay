<template>
  <div>
    <div class="chrome shine" :data-text="text">
      {{ text[0] }}<span class="spark"></span>{{ text.substring(1) }}
    </div>
  </div>
</template>

<script>
import { useSlots } from "vue";

export default {
  name: "RetroText",
  data: function () {
    return {
      text: "String",
    };
  },
  mounted() {
    const slots = useSlots();
    this.text = slots.default?.()[0].children;
  },
};
</script>

<style scoped>
.chrome {
  font-family: "Jersey 25", sans-serif;
  font-weight: 900;
  font-size: calc(30px + 10vh);
  background-image: linear-gradient(
    #2989cc 0%,
    #d3e5ec 50%,
    #592451 51%,
    #b3628d 55%,
    #592451 59%,
    #b3628d 65%,
    #ac86a6 75%,
    #b3628d 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.4);
  position: relative;
}

.chrome:before {
  content: attr(data-text);
  text-shadow: -1px -1px 1px #2989cc, -2px -2px 1px #2989cc, -3px -3px 1px #2989cc, 1px 1px 1px #000,
    0px -1px 2px #000, -1px -2px 2px #000, 0 0 5px rgba(255, 255, 255, 1);
  opacity: 1;
  position: absolute;
  z-index: -1;
}

.shine:after {
  content: attr(data-text);
  background-image: linear-gradient(225deg, transparent 53%, white 55%, transparent 58%);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-background-clip: text;
  z-index: 999;
  background-size: 400% 400%;
  animation: shine 10s ease infinite;
  animation-delay: var(--shine-delay, 0s);
}

.spark {
  margin-top: calc(4vh);
  margin-left: -0.3em;
  line-height: 0;
  position: absolute;
  width: 37px;
  height: 45px;
  z-index: 999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='120 250 1700 1200' width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3C!-- Created with Method Draw - http://github.com/duopixel/Method-Draw/ --%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect fill='none' id='canvas_background' height='402' width='182' y='-1' x='-1'/%3E%3Cg display='none' overflow='visible' y='0' x='0' height='100%25' width='100%25' id='canvasGrid'%3E%3Crect fill='url(%23gridpattern)' stroke-width='0' y='0' x='0' height='100%25' width='100%25'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cellipse ry='183' rx='5' id='svg_2' cy='197.0375' cx='274.5' stroke-width='0' stroke='%23000' fill='%23fff'/%3E%3Cellipse transform='rotate(90 274.50000000000006,197.03750610351565) ' ry='183' rx='5' id='svg_3' cy='197.0375' cx='274.5' stroke-width='0' stroke='%23000' fill='%23fff'/%3E%3Cellipse stroke='%23000' transform='rotate(126.69925689697266 276.19342041015625,195.4363708496094) ' ry='90.194158' rx='3.223029' id='svg_4' cy='195.43637' cx='276.193439' stroke-width='0' fill='%23fff'/%3E%3Cellipse stroke='%23000' transform='rotate(-134.6077117919922 276.19342041015625,195.43637084960938) ' ry='90.194158' rx='3.223029' id='svg_5' cy='195.43637' cx='276.193439' stroke-width='0' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E");
  filter: blur(0.5px);
  transform: scale(0);
  animation: blip 5s infinite;
  animation-timing-function: ease-in-out;
}

.spark-offset {
}

.chrome:last-of-type .spark {
  animation-delay: -2.5s;
}

@keyframes shine {
  0% {
    background-position: 0% 51%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 51%;
  }
}
</style>
