<template>
  <Navbar title="Admin">
    <NavLink path="overview" icon="dashboard" text="Overview" />
    <NavLink path="lobbies" icon="gamepad" text="Lobbies" />
    <NavLink path="logs" icon="list" text="Logs" />
    <NavLink path="crashes" icon="explosion" text="Crashes" />
    <NavLink path="metrics" icon="insights" text="Metrics" />
  </Navbar>
</template>
<script setup lang="ts">
import Navbar from "@/shared/components/Navbar.vue";
import NavLink from "@/shared/components/NavLink.vue";
</script>
