<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { computed, onMounted, ref } from "vue";

interface Snapshot {
  _id: string;
  dateUpdated: string;
  albumCover: string;
  image: string;
  isAlbumCoverVisible: boolean;
  post: string;
  author: string;
}

const snapshots = ref<Snapshot[]>([]);
const friends = ref<string[]>([]);
const showFriendsSnapshots = ref(false);

const fetchSnapshots = async () => {
  try {
    const response = await fetchy(`/api/snapshots/notExpired/`, "GET");
    const snapshotsWithSongImages = await Promise.all(
      response.map(async (snapshot: Snapshot) => {
        const song = await fetchy(`/api/songs/id/${snapshot.post}`, "GET");
        snapshot.albumCover = song.album_cover;
        return snapshot;
      }),
    );
    snapshots.value = snapshotsWithSongImages;
  } catch (error) {
    console.error("Error fetching snapshots:", error);
  }
};

const fetchFriends = async () => {
  try {
    const response = await fetchy(`/api/friends`, "GET");
    friends.value = response;
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
};

const filteredSnapshots = computed(() => {
  if (showFriendsSnapshots.value) {
    return snapshots.value.filter((snapshot) => friends.value.includes(snapshot.author));
  }
  return snapshots.value;
});

const toggleImage = (snapshot: Snapshot) => {
  snapshot.isAlbumCoverVisible = !snapshot.isAlbumCoverVisible;
};

const toggleShowFriendsSnapshots = () => {
  showFriendsSnapshots.value = !showFriendsSnapshots.value;
};

onMounted(async () => {
  await fetchSnapshots();
  await fetchFriends();
});
</script>

<template>
  <div class="snapshot-container">
    <h1>Snapshots</h1>
    <button @click="toggleShowFriendsSnapshots">
      {{ showFriendsSnapshots ? "Show All Snapshots" : "Show Friends Only" }}
    </button>
    <div v-if="showFriendsSnapshots && filteredSnapshots.length === 0" class="no-snapshots-message">
      <div class="no-snapshots-box">No snapshots from friends yet!</div>
    </div>
    <div class="snapshot-list">
      <div v-for="snapshot in filteredSnapshots" :key="snapshot._id" class="polaroid-container">
        <div class="polaroid" @click="toggleImage(snapshot)">
          <img :src="snapshot.isAlbumCoverVisible ? snapshot.image : snapshot.albumCover" class="image" alt="Snapshot" />
        </div>
        <div class="polaroid-info">
          <p class="username">{{ snapshot.author }}</p>
          <p class="date">{{ new Date(snapshot.dateUpdated).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.snapshot-container {
  padding: 20px;
  text-align: center;
}

.snapshot-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.polaroid-container {
  position: relative;
  width: 300px;
  height: 400px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.polaroid {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/polaroid.png"); /* Replace with your actual polaroid image path */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.image {
  width: 61%;
  height: 60%;
  object-fit: cover;
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, 0%);
}

.date {
  font-size: 0.9em;
}

.no-snapshots-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.no-snapshots-box {
  padding: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  font-size: 1.2em;
  text-align: center;
}
</style>
