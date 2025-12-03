import { reactive } from "vue";

export const context = reactive({
  isConnected: false,
  state: null,
  isHost: false,
});
