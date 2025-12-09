<template>
    <div class="rating">
        <header>Rate 1-10</header>
        <div class="rating-buttons">
            <button class="rating-button" v-for="score in scores" @click="setRating(score)"
                :class="{ 'selected': score === rating }">{{ score }}</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            scores: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            rating: null
        }
    },
    methods: {
        setRating(number) {
            this.rating = number;
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
    background-color: var(--Caribbean_Green);
    padding: 1rem;
    gap: 1rem;

}

.rating header {
    font-family: "Science Gothic", sans-serif;
    font-size: 2rem;
    color: var(--Metallic_Yellow);
    border-bottom: 10px solid var(--Metallic_Yellow);
}

.rating-buttons {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
}

.rating-button {
    font-family: "Science Gothic", sans-serif;
    height: 10rem;
    width: auto;
    font-size: 3rem;
    background-color: beige;
}

.rating-button.selected {
    font-family: "Science Gothic", sans-serif;
    height: 10rem;
    width: auto;
    font-size: 3rem;
    background-color: green;
}
</style>