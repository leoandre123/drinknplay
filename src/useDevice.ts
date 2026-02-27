import { ref, onMounted } from "vue";

const isMobile = ref(false);

export function useDevice() {
  onMounted(() => {
    const update = () => {
      isMobile.value = window.matchMedia("(pointer: coarse)").matches;
    };

    update();
    window.addEventListener("resize", update);
  });

  return { isMobile };
}
