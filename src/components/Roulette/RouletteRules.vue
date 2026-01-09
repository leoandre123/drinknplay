<template>
    <div class="rules-layout" @click.self="$emit('close')"> 
       <div class="pop-up" >
            
            <button class="close-button" @click="$emit('close')">
                Close
            </button>

            <div class="content">
                
                <ul>
                    <li style="font-weight: bold;">{{$t("roulette.noPoints")}}</li>
                    <li>{{$t("roulette.betCredits")}}</li>
                    <li>{{$t("roulette.ifWin")}}</li>
                    <li>{{$t("roulette.ifLose")}}</li>
                    <li>{{$t("roulette.correctColor")}}</li>
                    <li>{{$t("roulette.correctNumber")}}</li>
                    <li>{{$t("roulette.wrongNumberOrColor")}}</li>
                </ul>
                <ul>
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


<style>
.style-layout{
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;

}

.pop-up{
    position: relative;
    border-radius: 10px;
    border: 1px solid rgba(250,250,250,0.5);
    background: rgba(6, 188, 243,0.5);
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
