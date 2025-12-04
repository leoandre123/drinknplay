<template>
  <div class="create-container">hej</div>
</template>

<script>
export default {
  name: "CreateView",
  data: function () {
    return {};
  },
  mounted() {},
  beforeUnmount() {},
  methods: {},
};
</script>

<style scoped>
.create-container {
  width: 100vw;
  height: 100vh;
  justify-items: center;
  align-content: center;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgb(102, 0, 32) 0%,
    rgb(116, 18, 92) 49.5%,
    rgb(164, 34, 144) 90%
  );
  color: white;
}
</style>
