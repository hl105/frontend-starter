<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

interface Cover {
  _id: string;
  image: string;
  text: string;
  post: string;
  song_image: string;
  isHovered: boolean;
}

interface Lock {
  _id: string;
  to: string;
  from: string;
}

const showLocked = ref(false);
const unlockedCovers = ref<Cover[]>([]);
const lockedCovers = ref<Lock[]>([]);

const userStore = useUserStore();
const username = ref(userStore.currentUsername);

const fetchUnlockedCovers = async () => {
  try {
    const covers = await fetchy(`/api/covers/notLocked/${username.value}`, "GET");
    const coversWithSongImages = await Promise.all(
      covers.map(async (cover: Cover) => {
        const song = await fetchy(`/api/songs/id/${cover.post}`, "GET");
        cover.song_image = song.album_cover;
        return cover;
      }),
    );
    unlockedCovers.value = coversWithSongImages;
  } catch (error) {
    console.error("Error fetching unlocked covers:", error);
  }
};

const fetchLockedCovers = async () => {
  try {
    const locks = await fetchy(`/api/locks/${username.value}`, "GET");
    lockedCovers.value = locks;
  } catch (error) {
    console.error("Error fetching locked covers:", error);
  }
};

const toggleLocked = async () => {
  showLocked.value = !showLocked.value;
  if (showLocked.value && lockedCovers.value.length === 0) {
    await fetchLockedCovers();
  }
};

onMounted(async () => {
  await fetchUnlockedCovers();
});

const hoverVinyl = (cover: Cover) => {
  cover.isHovered = true;
};

const leaveVinyl = (cover: Cover) => {
  cover.isHovered = false;
};
</script>

<template>
  <div class="cover-container">
    <div class="option-container">
      <h3>{{ showLocked ? "Locked Posts" : "Unlocked Covers" }}</h3>
      <button @click="toggleLocked">{{ showLocked ? "Show Unlocked Covers" : "Show Locked Posts" }}</button>
    </div>

    <div v-if="showLocked">
      <div class="cover-list">
        <div v-for="lock in lockedCovers" :key="lock._id" class="vinyl-container locked">
          <div class="vinyl" :style="{ backgroundImage: 'url(lp.png)' }"></div>
          <div class="center-circle">
            <p>{{ new Date(lock.to).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="cover-list">
        <div v-for="cover in unlockedCovers" :key="cover._id" class="vinyl-container">
          <div class="vinyl" :style="{ backgroundImage: 'url(' + cover.song_image + ')' }"></div>
          <div class="center-circle" @mouseover="hoverVinyl(cover)" @mouseleave="leaveVinyl(cover)">
            <img :src="cover.image" class="uploaded-image" />
          </div>
          <p class="cover-text" v-if="cover.isHovered">{{ cover.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.option-container {
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 20px;
}

.cover-container {
  padding: 20px;
}

.cover-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.vinyl-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: auto;
}

.vinyl {
  width: 100%;
  height: 100%;
  background-size: cover;
  border-radius: 50%;
  animation: spin 20s linear infinite;
}

.vinyl-container:hover .center-circle {
  opacity: 0.7;
}

.vinyl-container:hover .cover-text {
  visibility: visible;
}

.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 105px;
  height: 105px;
  background-color: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;
  font-size: 1.2em;
  color: white;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2em;
  visibility: hidden;
  text-align: center;
  color: black;
}

.locked .center-circle {
  background-color: darkgray;
  color: black;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
