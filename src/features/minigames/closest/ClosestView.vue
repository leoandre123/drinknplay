<template>
  <div class="closest-container">
    <div class="panel">
      <h1>Närmast Vinner</h1>
    </div>
    <div class="body">
      <div class="panel info">
        <h1>{{ timer }}s</h1>
        Round {{ currentRound + 1 }} / {{ roundCount }}
        <div class="player-list">
          <div v-for="guess in guesses" class="player">
            <Avatar
              :settings="
                context.state.players.find((x) => x.id == guess.id)?.avatarSettings ?? DefaultAvatar
              "
            />
            <div class="player-info">
              <div class="info-line">
                <p>{{ context.state.players.find((x) => x.id == guess.id)?.name }}</p>
                <p>Pts: {{ guess.points ?? "-" }}</p>
              </div>
              <div class="info-line">
                <p>Distance:</p>
                <p>{{ renderDistances.find((x) => x.id == guess.id)?.distance }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel main-content">
        <template v-if="!showMap">
          <div
            v-if="currentLocation"
            class="photo-container"
            :style="{ backgroundImage: `url(${currentLocation.img_uri})` }"
          ></div>
        </template>

        <div v-show="showMap" class="map-container">
          <LMap ref="map" :zoom="zoom" :center="target">
            <LTileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              layer-type="base"
              name="OpenStreetMap"
              attribution="© OpenStreetMap"
            ></LTileLayer>

            <LMarker
              v-for="guess in guesses"
              :key="guess.id"
              :icon="getAvatarIcon(guess.id)"
              :lat-lng="guess.pos"
            />
            <LMarker
              :icon="svgIcon"
              v-if="showTarget && currentLocation"
              :lat-lng="currentLocation.pos"
            />
          </LMap>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { context } from "@/context";
import Avatar from "@/shared/components/avatar/Avatar.vue";
import AvatarMarkerIcon from "@/shared/components/avatar/AvatarMarkerIcon.vue";
import { socket } from "@/socket";
import { DefaultAvatar } from "@shared/models/AvatarSettings";
import { geoDistance } from "@shared/utils/MathHelper";
import { LMap, LMarker, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { Icon, svg } from "leaflet";
import { DivIcon } from "leaflet";
import { createApp, toRaw } from "vue";

const svgIcon = new Icon({
  iconUrl: "/marker.png",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default {
  name: "ClosestView",
  components: { LMap, LMarker, LTileLayer, Avatar },
  data() {
    return {
      context,
      DefaultAvatar,
      svgIcon,
      zoom: 2,
      showMap: true,
      showTarget: false,
      timer: 69,
      selectedPosition: null,
      target: [0, 0],
      guesses: [],
      currentLocation: null,
      currentRound: 0,
      roundCount: 0,
      avatarIcons: new Map(),
    };
  },
  mounted() {
    socket.on("closest:updatePlayers", (players) => {
      this.guesses = players;
    });
    socket.on("closest:startRound", this.onRoundStart);
    socket.on("closest:setLocation", (loc) => (this.currentLocation = loc));
    socket.on("closest:updateRound", (round, count) => {
      this.currentRound = round;
      this.roundCount = count;
    });
  },
  beforeUnmount() {
    socket.off("closest:startRound");
    socket.off("closest:setLocation");
    socket.off("closest:updateRound");
  },
  methods: {
    onRoundStart(time) {
      this.showMap = false;

      const updateTimer = () => {
        const delta = time - Date.now();
        if (delta > 0) {
          this.timer = Math.ceil(delta / 1000);
          setTimeout(updateTimer, 10);
        } else {
          this.timer = 0;
          this.target = [0, 0];
          this.zoom = 2;
          this.showMap = true;
          this.showTarget = false;

          this.$nextTick(() => {
            const map = this.$refs.map?.leafletObject;
            if (!map || !this.currentLocation) return;
            map.invalidateSize();
            console.log(map);
            //const points = [this.currentLocation.pos, ...this.guesses.map((g) => g.pos)];
            const points = [
              toRaw(this.currentLocation.pos),
              ...this.guesses.map((g) => toRaw(g.pos)),
            ];

            console.log(points);
            points.forEach((p, i) => {
              console.log(
                i,
                p,
                Array.isArray(p),
                typeof p?.[0],
                typeof p?.[1],
                Number.isFinite(p?.[0]),
                Number.isFinite(p?.[1]),
              );
            });
            map.flyToBounds(points, {
              padding: [50, 50],
              animate: true,
              duration: 2.5,
            });

            setTimeout(() => {
              this.showTarget = true;
            }, 5000);

            setTimeout(() => {
              map.flyToBounds([this.currentLocation.pos], {
                padding: [50, 50],
                animate: true,
                duration: 2.5,
              });
            }, 7000);
          });
        }
      };

      updateTimer();
    },
    getDistanceString(dist) {
      return dist < 1_000
        ? `${dist.toFixed(0)}m`
        : dist < 100_000
          ? `${(dist / 1000).toFixed(1)}km`
          : `${(dist / 1000).toFixed(0)}km`;
    },
    getAvatarIcon(playerId) {
      if (!this.avatarIcons.has(playerId)) {
        const player = this.context.state.players.find((p) => p.id === playerId);

        this.avatarIcons.set(playerId, createAvatarIcon(player?.avatarSettings ?? DefaultAvatar));
      }

      return this.avatarIcons.get(playerId);
    },
  },
  computed: {
    distances() {
      if (!this.currentLocation) return [];
      return this.guesses.map((g) => {
        return {
          id: g.id,
          distance: geoDistance(g.pos, this.currentLocation.pos),
        };
      });
    },
    renderDistances() {
      return this.distances.map((d) => {
        const dist = this.getDistanceString(d.distance);

        return { id: d.id, distance: dist };
      });
    },
  },
};
function createAvatarIcon(avatarSettings) {
  const el = document.createElement("div");

  createApp(AvatarMarkerIcon, {
    settings: avatarSettings,
  }).mount(el);

  return new DivIcon({
    html: el,
    className: "",
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });
}
</script>
<style scoped>
.closest-container {
  position: absolute;
  width: 100dvw;
  height: 100dvh;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: rgb(32, 16, 79);
  color: white;
  padding: 2rem;
  gap: 1rem;
}
.body {
  display: flex;
  flex-grow: 1;
  gap: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}
.panel {
  background-color: rgba(0, 0, 0, 0.409);
  border-radius: 1rem;
  padding: 1rem;
  border: 0.5rem outset rgb(26, 12, 42);
}

.info {
  width: 15rem;
}

.main-content {
  flex-grow: 1;
  overflow: hidden;
  place-content: center;
  display: flex;
}
.photo-container {
  max-height: 90%;
  max-width: 90%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  border: 0.5rem inset rgb(26, 12, 42);
}
.map-container {
  z-index: 0;
  flex-grow: 1;
  border: 0.5rem inset rgb(26, 12, 42);
}
.player-list {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
}

.player {
  padding: 1rem;
  background-color: black;
  color: white;
  border-radius: 0.25rem;
  display: flex;
  height: 2rem;
  gap: 1rem;
}

.player-info {
  flex-grow: 1;
}
.player-info p {
  margin: 0;
}
.info-line {
  height: 1rem;
  display: flex;
  justify-content: space-between;
}
</style>
