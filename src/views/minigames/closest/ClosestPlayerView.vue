<template>
  <div class="closest-player-container">
    <div class="map-container">
      <LMap ref="map" :zoom="2" :center="[0, 0]" @click="onMapClick">
        <LTileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution="© OpenStreetMap"
        ></LTileLayer>
        <LMarker :icon="icon" v-if="icon && selectedPosition" :lat-lng="selectedPosition" />
      </LMap>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LMarker, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { DivIcon, Icon } from "leaflet";

import { createApp } from "vue";
import Avatar from "@/components/Avatar.vue";
import { DefaultAvatar } from "@shared/AvatarHelper";
import { context } from "@/context";
import AvatarMarkerIcon from "@/components/AvatarMarkerIcon.vue";
import { socket } from "@/socket";

export default {
  name: "ClosestPlayerView",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      icon: null,
      selectedPosition: null,
    };
  },
  mounted() {
    const el = document.createElement("div");
    createApp(AvatarMarkerIcon, {
      settings: context.getCurrentPlayer()?.avatarSettings ?? DefaultAvatar,
    }).mount(el);

    this.icon = new DivIcon({
      html: el,
      className: "",
      iconSize: [50, 50],
      iconAnchor: [25, 50],
    });
  },
  methods: {
    onMapClick(e) {
      console.log("Event:", e);
      this.selectedPosition = [e.latlng.lat, e.latlng.lng];
      console.log("Clicked: ", this.selectedPosition);
      socket.emit("closest:updatePosition", this.selectedPosition);
    },
  },
};
</script>
<style scoped>
.closest-player-container {
  position: absolute;
  width: 100dvw;
  height: 100dvh;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
}
.map-container {
  z-index: 0;
  flex-grow: 1;
}
</style>
