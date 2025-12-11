<script setup lang="ts">
const model = defineModel();

const maskaOption = {
  mask: "#,###,###,###,###,###,###",
  reversed: true
}

</script>
<template>
  <input class="w-full border px-3 py-1 rounded-sm" v-model="model" v-maska:[maskaOption] type="text" />
</template>
