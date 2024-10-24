<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const currentSong = ref<Record<string, string> | null>(null);

const loaded = ref(false);
const error = ref<string | null>(null); // potential errors
const getCurrentSong = async () => {
  try {
    const response = await fetchy("/api/songs", "POST");
    if (response) {
      currentSong.value = response.song;
      // console.log(response.message);
    } else {
      currentSong.value = null;
    }
  } catch (_) {
    error.value = "Failed to fetch the current song.";
  }
};

onBeforeMount(async () => {
  await getCurrentSong();
  loaded.value = true;
});
</script>
<template>
  <section v-if="isLoggedIn">
    <h2>currently listening to</h2>
    <div style="font-size: 5rem; width: 100%; text-align: center">🎧</div>
    <div class="song" v-if="loaded && currentSong">
      <h3>
        <a :href="currentSong.url">{{ currentSong.name }}</a>
      </h3>
      <p><strong>Artist:&nbsp;</strong> {{ currentSong.artist }}</p>
      <p><strong>Album:&nbsp;</strong> {{ currentSong.album }}</p>
      <!-- <p><strong>Lyrics:</strong></p> -->
      <!-- <pre>{{ currentSong.lyrics }}</pre> -->
    </div>

    <p v-else-if="loaded && !currentSong">No song is currently playing.</p>
    <!-- <p v-if="error" style="color: red">{{ error }}</p> -->
    <p v-else-if="!loaded">Loading...</p>
  </section>
</template>

<style scoped>
section,
h2 {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin: 0 auto;
  max-width: 60em;
  padding: 1em;
}

.song {
  border-radius: 1em;
  background-color: var(--base-bg);
  padding: 1em;
}

a {
  display: inline-block;
  color: #80cfa9;
}

p {
  display: flex;
  align-items: center;
}
</style>
