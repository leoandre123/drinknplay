<template>
    <div class="drawings">

        <h1>All drawings</h1>
        <div>What do you like?</div>
        <div v-for="painting in submittedPaintings">
            <img :src="painting.data"></img>
            <h1>{{context.state.players.find(x => x.id == painting.playerId).name}}</h1>
        </div>
        <div class="showcase"></div>
        <div class="tools">Rate on you pgone</div>
        <p>{{ context.state.players }}</p>
    </div>
</template>

<script>
//access via https://localhost:5173/game?id=draw&mode=host

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

<style scoped>
.drawings {
    background-color: black;
    color: red;
    display: flex;
    flex-direction: column;

    height: 100%;
    width: 100%;
}

.showcase {
    background: yellow;
    flex-grow: 1;
}
</style>