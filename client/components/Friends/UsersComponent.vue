<script setup lang="ts">
import UserComponent from "@/components/Friends/UserComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

interface User {
  _id: string;
  username: string;
  profileImage: { value: string };
  isFriend: boolean;
  isFriendRequested: boolean;
  mode: string;
}

const searchQuery = ref("");
const searchResult = ref<User[] | null>(null);

const searchUser = async () => {
  try {
    const users = await fetchy(`/api/users/${searchQuery.value}`, "GET");
    const friendsResponse = await fetchy("/api/friends", "GET");
    const requestsResponse = await fetchy("/api/friend/requests", "GET");

    searchResult.value = users.map((user: User) => {
      const isFriend = friendsResponse.some((friend: any) => friend === user.username);
      const isFriendRequested = requestsResponse.some((request: any) => request.to === user.username || request.from === user.username);
      return { ...user, isFriend, isFriendRequested };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  searchResult.value = null;
};

onMounted(async () => {
  await searchUser();
});
</script>

<template>
  <div class="users-container">
    <h1>User Search</h1>
    <div class="search-section">
      <input v-model="searchQuery" @keyup.enter="searchUser" placeholder="username (empty for all)" />
      <button class="search-button" @click="searchUser">Search</button>
      <button class="search-button" @click="clearSearch" v-if="searchResult">Clear</button>
    </div>
    <div v-if="searchResult" class="search-result">
      <UserComponent
        v-for="user in searchResult"
        :key="user._id"
        :_id="user._id"
        :username="user.username"
        :profileImage="user.profileImage?.value || 'client/assets/images/polaroid.png'"
        :isFriend="user.isFriend"
        :isFriendRequested="user.isFriendRequested"
        :mode="'friend'"
      />
    </div>
  </div>
</template>

<style scoped>
.users-container {
  padding: 20px;
}

.search-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.search-result,
.users-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.search-button {
  width: 5em;
  height: 2em;
  border-radius: 1em;
  border: 2px solid #ffffff;
}
</style>
