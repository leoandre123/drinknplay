<template>
    <div class="rules-layout" @click.self="$emit('close')"> 
       <div class="pop-up" >
            
            <button class="close-button" @click="$emit('close')">
                {{$t("lobbyInfo.close")}}
            </button>

            <div class="content">
                <h3 class="howToWin">{{$t("lobbyInfo.howToWin")}}</h3>
                <ul class="howToWinList">
                    <li>{{$t("lobbyInfo.info1")}}</li>
                </ul>
                <ul class="howToWinList">
                    <li>{{$t("lobbyInfo.info2")}}</li>
                    <li>{{$t("lobbyInfo.info3")}}</li>
                </ul>    
                <h3 class="drinkingInfo">{{$t("lobbyInfo.drinking")}}</h3>
                <ul class = drinkingInfoList>
                    <li>{{$t("lobbyInfo.info4")}}</li>
                    <li>{{$t("lobbyInfo.info5")}}</li>
                    <li>{{$t("lobbyInfo.info6")}}</li>
                    <li>{{$t("lobbyInfo.info7")}}</li>
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
    color: var(--Points_Info);
    text-shadow: 2px 2px black;
}
.howToWinList{
    color: var(--Points_Info);
    text-shadow: 2px 2px black;
}
.drinkingInfo{
    text-align: center;
    color: var(--Drunkness_Info);
    text-shadow: 2px 2px black;
}

.drinkingInfoList {
    color: var(--Drunkness_Info);
    text-shadow: 2px 2px black;
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
    background: var(--Trans_Violet_Blue);
    padding: 20px;
    
    
}
.close-button{
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgb(59, 56, 56);
    color:white;
    font-weight: bold;
    
    
}
</style>
