<script setup lang="ts">
import CurrentSongComponent from "@/components/Song/CurrentSongComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="!isLoggedIn">Please login!</h1>
    </section>
    <CurrentSongComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
