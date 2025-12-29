

<template>
    <RetroContainer>
<RouletteWheel/>
    </RetroContainer>


</template>
<script>
import RetroContainer from '@/components/RetroContainer.vue';
import RouletteWheel from '@/components/RouletteWheel.vue';

export default {
    name: "RouletteView",
    components: {RouletteWheel, RetroContainer}
}
</script>