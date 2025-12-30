<template>
    <div class="MazeHostContainer">

    </div>
</template>

<script>
export default {
    name: "HostMazeGameView"
}
</script>

<style scoped>
.MazeHostContainer {
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background-image: radial-gradient(circle farthest-corner at 10% 20%,
            rgb(102, 0, 32) 0%,
            rgb(116, 18, 92) 49.5%,
            rgb(164, 34, 144) 90%);
}
</style>