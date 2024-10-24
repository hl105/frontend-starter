<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { defineProps, defineEmits, ref } from "vue";

const props = defineProps({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  isFriend: {
    type: Boolean,
    required: true,
  },
  isFriendRequested: {
    type: Boolean,
    required: true,
  },
  mode: {
    type: String,
    default: "friend", //outgoing-request, incoming-request
  },
});

const emit = defineEmits(["remove-request"]);

const isFriend = ref(props.isFriend);
const isFriendRequested = ref(props.isFriendRequested);
const { currentUserId } = storeToRefs(useUserStore());

const toggleFriendStatus = async () => {
  if (isFriend.value) {
    try {
      await fetchy(`/api/friends/${props.username}`, "DELETE");
      isFriend.value = false;
    } catch (error) {
      console.error("Error unfriending:", error);
    }
  } else if (isFriendRequested.value) {
    try {
      await fetchy(`/api/friend/requests/${props.username}`, "DELETE");
      isFriendRequested.value = false;
    } catch (error) {
      console.error("Error removing friend request:", error);
    }
  } else {
    try {
      await fetchy(`/api/friend/requests/${props.username}`, "POST");
      isFriendRequested.value = true;
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  }
};

const removeFriendRequest = async () => {
  try {
    await fetchy(`/api/friend/requests/${props.username}`, "DELETE");
    isFriend.value = false;
    isFriendRequested.value = false;
    emit("remove-request", props._id);
  } catch (error) {
    console.error("Error removing friend request:", error);
  }
};

const acceptFriendRequest = async () => {
  try {
    await fetchy(`/api/friend/accept/${props.username}`, "PUT");
    isFriend.value = true;
    isFriendRequested.value = false;
    emit("remove-request", props._id);
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};
</script>
<template>
  <div class="user-card">
    <img :src="props.profileImage" class="profile-image" />
    <h3>{{ props.username }}</h3>
    <template v-if="props._id !== currentUserId">
      <template v-if="mode === 'outgoing-request'">
        <button @click="removeFriendRequest">Remove Request</button>
      </template>
      <template v-else-if="mode === 'incoming-request'">
        <button @click="acceptFriendRequest">Accept Request</button>
        <button @click="removeFriendRequest">Reject Request</button>
      </template>
      <template v-else>
        <button @click="toggleFriendStatus">
          <template v-if="isFriend"> Unfriend </template>
          <template v-else-if="isFriendRequested"> Friend Requested </template>
          <template v-else> Friend </template>
        </button>
      </template>
    </template>
    <template v-else>
      <p>current user!</p>
    </template>
  </div>
</template>

<style scoped>
.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 200px;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}
</style>
