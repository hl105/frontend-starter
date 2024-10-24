import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUserProfileImage = ref("");
    const currentUsername = ref("");
    const currentUserId = ref("");

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
    };

    const loginUser = async () => {
      window.location.href = "/api/spotify";
    };

    const updateSession = async () => {
      try {
        const { username, profileImage, _id } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        currentUserProfileImage.value = profileImage.value;
        currentUserId.value = _id;
      } catch {
        currentUsername.value = "";
        currentUserProfileImage.value = "";
        currentUserId.value = "";
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      currentUserProfileImage,
      currentUserId,
      isLoggedIn,
      loginUser,
      updateSession,
      logoutUser,
      deleteUser,
    };
  },
  { persist: true },
);
