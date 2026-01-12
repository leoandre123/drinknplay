<template>
    <div class="rating-view-container">
        <div class="rating" v-if="!voted">
            <header>{{ $t("draw.rate10") }}</header>
            <div class="rating-buttons">
                <button class="rating-button" v-for="score in scores" @click="setRating(score)"
                    :class="{ 'selected': score === rating }">{{ score }}</button>
            </div>
            <button class="save-button" @click="sendRating" :disabled="rating == null">{{ $t("draw.vote") }}</button>
        </div>

        <div v-else>
            <h1 class="vote-confirmed">{{ $t("draw.voteConfirmed") }} {{ rating }} </h1>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            scores: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            rating: null,
            voted: false,
        }
    },
    methods: {
        setRating(number) {
            this.rating = number;
        },
        sendRating() {
            this.voted = true;
            this.$emit('rating-submitted', this.rating);
        }
    }
}
</script>

<style scoped>
.rating {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    flex-direction: column;
    background-color: var(--Violet_Blue);
    padding: 1rem;
    gap: 1rem;
}

.rating header {
    font-family: "Science Gothic", sans-serif;
    font-size: 4vw;
    color: var(--Metallic_Yellow);
    border-bottom: 0.5vw solid var(--Metallic_Yellow);
}

.rating-buttons {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(5, 1fr);
    gap: 1vw;
}

.rating-button {
    font-family: "Science Gothic", sans-serif;
    height: 10vw;
    width: auto;
    font-size: 5vw;
    background-color: beige;
}

.rating-button.selected {
   font-family: "Science Gothic", sans-serif;
    height: 10vw;
    width: auto;
    font-size: 5vw;
    background-color: green
}

.save-button {
    font-family: "Science Gothic", sans-serif;
    height: 10vw;
    width: auto;
    font-size: 5vw;
    background-color: beige;
}

.vote-confirmed {
    color: var(--Metallic_Yellow);
    font-size: 8vw;
    font-family: "Science Gothic", sans-serif;
    height: 100%;
    width: 100%;
}

.rating-view-container{
    font-family: "Science Gothic", sans-serif;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    margin: 0;
    background-color: var(--Violet_Blue);
    border: 0;
    min-height: 100dvh;
}
   
   

</style>