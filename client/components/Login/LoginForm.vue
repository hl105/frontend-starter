<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";

const { loginUser, updateSession } = useUserStore();

async function login() {
  await loginUser();
  void updateSession();
  void router.push({ name: "Home" });
}
</script>

<template>
  <button @click="login" class="pure-button pure-button-primary">Log in with Spotify</button>
</template>

<style scoped>
button {
  display: flex;
  justify-content: center;
}
</style>
