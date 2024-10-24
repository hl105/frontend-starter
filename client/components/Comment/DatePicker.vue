<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { defineEmits, ref } from "vue";

const date = ref(null);
const emit = defineEmits(["date"]);

const emitDate = (newDate: any) => {
  emit("date", newDate); // Emit "change" event manually when date changes
};
</script>

<template>
  <div class="date-picker">
    <p>Locked until</p>
    <VueDatePicker v-model="date" @update:modelValue="emitDate" />
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
