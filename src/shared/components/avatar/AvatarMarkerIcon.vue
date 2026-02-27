<template>
  <div class="avatar-marker">
    <Avatar :settings="settings" />
  </div>
</template>
<script lang="ts">
import { GetRandomAvatar } from "@shared/models/AvatarSettings";
import Avatar from "./Avatar.vue";

export default {
  name: "AvatarMarkerIcon",
  props: {
    settings: {
      type: Object,
      default: GetRandomAvatar(),
    },
  },
  components: { Avatar },
};
</script>
<style scoped>
.avatar-marker {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;

  background: url(/marker.png);
  background-size: cover;
  padding: 20%;
  box-sizing: border-box;
}
</style>
