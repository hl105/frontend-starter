<script setup lang="ts">
import CoverUpload from "@/components/Comment/CoverUpload.vue";
import DatePicker from "@/components/Comment/DatePicker.vue";
import SnapshotUpload from "@/components/Comment/SnapshotUpload.vue";
import ToggleButton from "@/components/Comment/ToggleButton.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

type CoverData = { image: string; text: string };
type SnapshotData = { image: string };

const selectedOption = ref("cover");
const coverData = ref<CoverData | null>(null);
const snapshotData = ref<SnapshotData | null>(null);
const albumCoverUrl = ref<string | null>(null);
const from = ref(new Date());
const to = ref<Date | null>(null);

const handleCommentOption = (option: string) => {
  // console.log("Selected option changed to:", selectedOption.value);
  selectedOption.value = option;
};

const handleCoverData = (data: { image: string; text: string }) => {
  coverData.value = data;
  // console.log(coverData.value.image);
  snapshotData.value = null; //clear snapshot data
};

const handleSnapshotData = (data: { image: string }) => {
  snapshotData.value = data;
  coverData.value = null; // clear cover data
};

const handleDateChange = (newDate: Date | null) => {
  to.value = newDate;
};

const userStore = useUserStore();
const session = ref<string | null>(null);
const recentSongId = ref<string | null>(null);

const getRecentSong = async () => {
  try {
    session.value = userStore.currentUsername;

    const response = await fetchy("/api/songs/recent", "GET");
    // console.log("RESPONSE", response.recentSongId);

    if (response) {
      recentSongId.value = response.recentSong._id;
      albumCoverUrl.value = response.recentSong.album_cover;
    } else {
      console.error("response empty");
    }
  } catch (e: any) {
    console.log("error while getting song", e);
  }
};

const submitData = async () => {
  if (!recentSongId.value) {
    console.error("SongId is missing");
    return;
  }
  if (coverData.value) {
    const coverResponse = await fetchy("/api/covers", "POST", {
      body: {
        songId: recentSongId.value,
        text: coverData.value.text,
        lyrics: "",
        image: coverData.value.image,
      },
    });

    const coverId = coverResponse?.cover?._id;

    if (coverId && to.value) {
      const lockResponse = await fetchy("/api/locks", "POST", {
        body: {
          comment: coverId,
          from: from.value.toISOString(),
          to: to.value.toISOString(),
        },
      });

      // console.log("Lock created:", lockResponse);
      void router.push({ name: "Profile" });
    } else {
      console.error("Failed to retrieve commentId after cover creation");
    }
  } else if (snapshotData.value) {
    await fetchy("/api/snapshots", "POST", {
      body: {
        songId: recentSongId.value,
        text: "",
        lyrics: "",
        image: snapshotData.value.image,
      },
    });
    void router.push({ name: "Snapshots" });
  }
};

onBeforeMount(async () => {
  await getRecentSong();
});
</script>

<template>
  <main class="column" :style="{ backgroundImage: albumCoverUrl ? 'url(' + albumCoverUrl + ')' : '' }">
    <toggleButton @commentOption="handleCommentOption"></toggleButton>
    <div class="comment-content">
      <CoverUpload @coverData="handleCoverData" v-if="selectedOption === 'cover'" />
      <DatePicker @date="handleDateChange" v-if="selectedOption === 'cover'"></DatePicker>
      <SnapshotUpload @snapshotData="handleSnapshotData" v-if="selectedOption === 'snapshot'" />
    </div>
    <button @click="submitData">post ✨</button>
  </main>
</template>

<style scoped>
.column {
  padding-top: 7vh;
  background-size: cover;
  background-position: center;
}
.comment-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
main {
  flex-grow: 1;
}
</style>
