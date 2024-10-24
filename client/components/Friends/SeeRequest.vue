<!-- <script setup lang="ts">
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
  to: string;
}

const friendRequests = ref<User[]>([]);

const fetchFriendRequests = async () => {
  try {
    const requests = await fetchy("/api/friend/outgoing-requests", "GET");
    const users = await Promise.all(
      requests.map(async (request: Request) => {
        const user = await fetchy(`/api/users/${request.to}`, "GET");
        return user;
      }),
    );
    friendRequests.value = users;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
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
    <h1>Requested friend to:</h1>
    <div class="requests-list">
      <UserComponent
        v-for="request in friendRequests"
        :key="request._id"
        :_id="request._id"
        :username="request.username"
        :profileImage="request.profileImage?.value || 'client/assets/images/polaroid.png'"
        :isFriend="false"
        :isFriendRequested="true"
        mode="outgoing-request"
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
</style> -->
