<template>
  <img
    :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=${color}&bgcolor=${background}&data=${data}`"
    alt="QR code"
    class="qr"
  />
</template>

<script lang="ts">
export default {
  name: "QrCode",
  props: {
    data: String,
    background: { type: String, default: "ffffff" },
    color: { type: String, default: "000000" },
  },
};
</script>

<style scoped></style>
