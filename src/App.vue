<script setup lang="ts">
import Header from './components/Header.vue';

</script>

<template>
  <div class="container mx-auto p-4">
    <Header />
    <router-view />
    <div class="h-12 text-center items-center flex justify-center">
      <span>Made with ❤️ by <a href="https://nddcoder.com" class="text-indigo-600">NDDCoder</a> | <a
          href="https://github.com/dangdungcntt/thue-tncn" class="text-indigo-600">Github</a></span>
    </div>
  </div>
</template>
