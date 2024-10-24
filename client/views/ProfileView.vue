<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import CoverList from "@/components/Comment/CoverList.vue";

// import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername, currentUserProfileImage } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main class="profile">
    <div class="header">
      <img :src="currentUserProfileImage" class="profile-image" />
      <h1>{{ currentUsername }}</h1>
      <div class="buttons">
        <button class="pure-button" id="logout" @click="logout">Logout</button>
        <button class="pure-button" id="delete" @click="delete_">Delete User</button>
      </div>
    </div>
    <CoverList></CoverList>
  </main>
</template>

<style scoped>
.header {
  display: flex;
  gap: 3em;
  align-items: center;
  padding-left: 4em;
  padding-top: 2em;
}

.buttons {
  display: flex;
  padding: 2em;
  gap: 2em;
}

h1 {
  font-size: 4em;
}

.profile-image {
  width: 8em;
  height: 8em;
  border-radius: 50%;
  border: 0.3em solid black;
  object-fit: cover;
}

.pure-button {
  border: 0.1em solid #000000;
  background-color: white;
}
</style>
