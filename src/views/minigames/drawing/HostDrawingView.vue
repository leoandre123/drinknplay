<template>
    <h1>All drawings</h1>
    <div v-for="painting in submittedPaintings">
        <img :src="painting.data"></img>
        <h1>{{context.state.players.find(x => x.id == painting.playerId).name}}</h1>
    </div>

    <p>{{ context.state.players }}</p>
</template>

<script>
import { context } from "../../../context";
import { socket } from "../../../socket";


export default {
    data() {
        return {
            context,
            submittedPaintings: [],
        }
    },
    mounted() {
        socket.on("updateCanvas", (canvasData, playerId) => this.submittedPaintings.push({
            playerId: playerId,
            data: canvasData
        }));
    },
    beforeUnmount() {
        socket.off("updateCanvas");
    }

}

</script>

<style></style>