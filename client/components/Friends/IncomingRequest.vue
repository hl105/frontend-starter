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

interface Request {
  from: string;
}

const friendRequests = ref<User[]>([]);

const fetchFriendRequests = async () => {
  try {
    const requests = await fetchy(`/api/friend/incoming-requests`, "GET");
    const users = await Promise.all(
      requests.map(async (request: Request) => {
        const user = await fetchy(`/api/users/${request.from}`, "GET");
        return user;
      }),
    );
    friendRequests.value = users;
  } catch (error) {
    console.error("Error fetching incoming friend requests:", error);
  }
};

const handleRemoveRequest = (userId: string) => {
  friendRequests.value = friendRequests.value.filter((user) => user._id !== userId);
};

onMounted(async () => {
  await fetchFriendRequests();
});
</script>

<template>
  <div class="requests-container">
    <h1>Incoming Friend Requests:</h1>
    <div v-if="friendRequests.length === 0" class="no-requests-box">
      <p>No friend requests!</p>
    </div>
    <div class="requests-list">
      <UserComponent
        v-for="request in friendRequests"
        :key="request._id"
        :_id="request._id"
        :username="request.username"
        :profileImage="request.profileImage?.value || 'client/assets/images/polaroid.png'"
        :isFriend="false"
        :isFriendRequested="true"
        mode="incoming-request"
        @remove-request="handleRemoveRequest"
      />
    </div>
  </div>
</template>

<style scoped>
.requests-container {
  padding: 20px;
}

.requests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.no-requests-box {
  background-color: lightgray;
  color: darkgray;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
  width: 100%;
}
</style>
