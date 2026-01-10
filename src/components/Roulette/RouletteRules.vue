<template>
    <div class="rules-layout" @click.self="$emit('close')"> 
       <div class="pop-up" >
            
            <button class="close-button" @click="$emit('close')">
                {{$t("roulette.close")}}
            </button>

            <div class="content">
                
                <ul>
                    <h3 class="noPointInfo">{{$t("roulette.noPoints")}}</h3>
                </ul>
                    <ul class="betInfo">
                    <li>{{$t("roulette.betCredits")}}</li>
                    <li>{{$t("roulette.ifWin")}}</li>
                    <li>{{$t("roulette.ifLose")}}</li>
                    <li>{{$t("roulette.correctColor")}}</li>
                    <li>{{$t("roulette.correctNumber")}}</li>
                    <li>{{$t("roulette.wrongNumberOrColor")}}</li>
                </ul>
                <ul class="scoreInfo">
                    <li>{{$t("roulette.after3Rounds")}}:</li>
                    <li>{{$t("roulette.positiveScore")}}</li>
                    <li>{{$t("roulette.negativeScore")}}</li>
                </ul> 
                
            </div>


       </div>
    </div>

</template>

<script>

</script>


<style scoped>

.betInfo,
.scoreInfo{
    color: var(--Drunkness_Info);
}
.noPointInfo{
    color:  var(--Rules_Info);
    font-weight: bold;
}
.rules-layout{
    font-size: 2vw;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: absolute;
    z-index: 999;
    text-align: left;
}

.pop-up{
    position: relative;
    border-radius: 10px;
    border: 1px solid rgba(250,250,250,0.5);
    background: rgba(6, 188, 243,0.5);
    padding: 20px;
    background: var(--Trans_Violet_Blue);
}
.close-button{
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgb(59, 56, 56);
    color:white;
    font-weight: bold;
    
}
</style>
