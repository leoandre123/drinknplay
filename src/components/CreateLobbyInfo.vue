<template>
    <div class="rules-layout" @click.self="$emit('close')">
        <div class="pop-up">

            <button class="close-button" @click="$emit('close')">
                {{ $t("createlobbyinfo.b1") }}
            </button>

            <div class="content">
               
                <h3 class="howToWin">{{ $t("createlobbyinfo.h1") }}</h3>
                <ul class = "howToWinList">
                    <li>{{ $t("createlobbyinfo.p1") }}</li>
                    <li>{{ $t("createlobbyinfo.p2") }}</li>
                    <li>{{ $t("createlobbyinfo.p3") }}</li>
                </ul>
                <h3 class="drinkingInfo">{{ $t("createlobbyinfo.h2") }}</h3>
                <ul class="drinkingInfoList">
                    <li>{{ $t("createlobbyinfo.p4") }}</li>
                    <li>{{ $t("createlobbyinfo.p5") }}</li>
                    <li>{{ $t("createlobbyinfo.p6") }}</li>
                </ul>

            </div>


        </div>
    </div>

</template>

<script>

</script>


<style scoped>

.howToWin{
    text-align: center;
    color: var(--Rules_Info);
  
}
.howToWinList{
    color: var(--Rules_Info);
}
.drinkingInfo{
    text-align: center;
    color: var(--Drunkness_Info);
}

.drinkingInfoList {
    color: var(--Drunkness_Info);
}

.rules-layout {
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: absolute;
    z-index: 1000;
    font-size: 2vw;
    color: var(--Metallic_Yellow);
    text-shadow: 2px 2px black;
}

.pop-up{
    padding: 20px;
    position: relative;
    border-radius: 10px;
    border: 1px solid rgba(250,250,250,0.5);
    background: var(--Trans_Violet_Blue);
}

.close-button {
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgb(59, 56, 56);
    color:white;
    font-weight: bold;
}
</style>
