<script setup lang="ts">
import { defineEmits, ref } from "vue";

const imageUrl = ref<string | null>(null);
const inputTrigger = ref<HTMLInputElement | null>(null);

const emit = defineEmits(["snapshotData"]);

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

      emit("snapshotData", {
        image: imageUrl.value,
      });
    };
  }
};
</script>

<template>
  <div class="snapshot-container">
    <div class="polaroid-container">
      <div class="polaroid"></div>
      <div class="center-square" @click="triggerImgUpload">
        <input type="file" accept="image/*" @change="imageUpload" ref="inputTrigger" style="display: none" />
        <div v-if="!imageUrl" class="upload-button">Upload Image</div>
        <img v-else :src="imageUrl" class="uploaded-image" alt="Uploaded Image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.polaroid-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin: auto;
}

.polaroid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/polaroid.png");
  background-size: cover;
}

.center-square {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 226px;
  height: 242px;
  background-color: gray;
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
</style>
