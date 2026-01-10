<template>
    <div class="rules-layout" @click.self="$emit('close')">
        <div class="pop-up">

            <button class="close-button" @click="$emit('close')">
                Close
            </button>

            <div class="content">

                <ul>
                    <li>{{ $t("createlobbyinfo.p1") }}</li>
                    <li>{{ $t("createlobbyinfo.p2") }}</li>
                    <li>If you lose, the betting amount will be subtracted in the standings table</li>
                    <li>Correct color: Win = + bet amount</li>
                    <li>Correct number: Win = 36 x bet amount</li>
                    <li>Wrong number/color: Lose = - bet amount</li>
                </ul>
                <ul>
                    <li>After 3 rounds:</li>
                    <li>Postive score - hand out sips</li>
                    <li>Negative score - drink that amount of sips</li>
                </ul>

            </div>


        </div>
    </div>

</template>

<script>

</script>


<style scoped>
.rules-layout {
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: absolute;
    z-index: 1000;

}

.pop-up {
    position: relative;
    border-radius: 10px;
    border: 1px solid rgba(250, 250, 250, 0.5);
    background: rgba(6, 188, 243, 0.5);
}

.close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgb(59, 56, 56);
    color: white;
    font-weight: bold;


}
</style>
