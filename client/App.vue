<script setup lang="ts">
import router from "@/router";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
    if (!isLoggedIn.value) {
      await router.push({ name: "Login" });
    }
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <div class="app-container">
    <header>
      <nav>
        <div class="title">
          <!-- <img src="@/assets/images/logo.svg" /> -->
          <RouterLink :to="{ name: 'Home' }">
            <h1>Memorify</h1>
          </RouterLink>
        </div>
        <ul>
          <li>
            <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Explore' }" :class="{ underline: currentRouteName == 'Explore' }"> Explore </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Snapshots' }" :class="{ underline: currentRouteName == 'Snapshots' }"> Snapshots </RouterLink>
          </li>
          <li v-if="isLoggedIn">
            <RouterLink :to="{ name: 'Profile' }" :class="{ underline: currentRouteName == 'Profile' }"> Profile </RouterLink>
          </li>
          <li v-else>
            <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
          </li>
        </ul>
      </nav>
      <article v-if="toast !== null" class="toast" :class="toast.style">
        <p>{{ toast.message }}</p>
      </article>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
@import "./assets/toast.css";

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

nav {
  padding: 1em 2em;
  background-color: #80cfa9;
  display: flex;
  align-items: center;
}

h1 {
  font-size: 1.5em;
  color: white;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.3em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: white;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

/* .underline {
  text-decoration: underline;
} */
</style>
