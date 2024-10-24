<script setup lang="ts">
import { defineEmits, ref } from "vue";

const imageUrl = ref<string | null>(null);
const inputTrigger = ref<HTMLInputElement | null>(null);
const textInput = ref<string>("");

const emit = defineEmits(["coverData"]);

const triggerImgUpload = (): void => {
  inputTrigger.value?.click();
};

const imageUpload = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      imageUrl.value = event.target?.result as string;
    };
  }
};

const emitData = (): void => {
  emit("coverData", {
    image: imageUrl.value,
    text: textInput.value,
  });
};

const updateText = (event: Event): void => {
  textInput.value = (event.target as HTMLInputElement).value;
  emitData();
};
</script>

<template>
  <div class="vinyl-container">
    <div class="vinyl"></div>
    <div class="center-circle" @click="triggerImgUpload">
      <!--- when clicked, triggers this input -->
      <input type="file" accept="image/*" @change="imageUpload" ref="inputTrigger" style="display: none" />
      <div v-if="!imageUrl" class="upload-button">Upload Image</div>
      <img v-else :src="imageUrl" class="uploaded-image" />
    </div>
    <input type="text" v-model="textInput" @input="updateText" placeholder="Listening to this song..." class="text-input" />
  </div>
</template>

<style scoped>
.vinyl-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: auto;
}

.vinyl {
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/lp.png");
  background-size: cover;
  border-radius: 50%;
  animation: spin 20s linear infinite;
}

.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 105px;
  height: 105px;
  background-color: gray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.upload-button {
  color: white;
  text-align: center;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-input {
  margin-top: 20px;
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
