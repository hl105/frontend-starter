<script setup lang="ts">
import CurrentSongComponent from "@/components/Song/CurrentSongComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());

async function create() {
  void router.push({ name: "create" });
}
</script>
<template>
  <main>
    <section>
      <h1 v-if="!isLoggedIn">Welcome to Memorify 🎧</h1>
    </section>
    <CurrentSongComponent />
    <button @click="create">create ✨</button>
    <footer>
      <hr />
      <div class="footer-text">
        <p>Made by Johanna Lee</p>
      </div>
    </footer>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3em;
}

h1 {
  text-align: center;
  font-size: 1.5em;
}

button {
  width: 10em;
  height: 3em;
  background-color: #80cfa9;
}

footer {
  display: flex;
  flex-direction: column;
}

.footer-text {
  display: flex;
  align-items: center;
  gap: 0.4em;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  /* margin: 0.5em 0; */
  width: 30%;
}
</style>
