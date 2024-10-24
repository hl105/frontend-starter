<script setup lang="ts">
import { defineEmits, ref } from "vue";

const emit = defineEmits(["commentOption"]);
const selectedOption = ref("cover");

const handleSelection = (option: string) => {
  selectedOption.value = option;
  emit("commentOption", option);
};
</script>

<template>
  <div class="btn-group btn-group-toggle" data-toggle="buttons">
    <label :class="['btn btn-secondary', selectedOption === 'cover' ? 'active' : '']">
      <input type="radio" name="options" id="option1" autocomplete="off" checked @change="handleSelection('cover')" class="custom-radio" />
      Cover
    </label>
    <label :class="['btn btn-secondary', selectedOption === 'snapshot' ? 'active' : '']">
      <input type="radio" name="options" id="option2" autocomplete="off" @change="handleSelection('snapshot')" class="custom-radio" />
      Snapshot
    </label>
  </div>
</template>

<style scoped>
input {
  display: none;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
}

.btn.active,
.btn:focus {
  background-color: #80cfa9;
  color: white;
}
</style>
