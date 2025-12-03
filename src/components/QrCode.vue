<template>
  <img
    :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`"
    alt="QR code"
    class="qr"
  />
</template>

<script>
export default {
  name: "QrCode",
  props: {
    data: String,
  },
};
</script>

<style scoped></style>
