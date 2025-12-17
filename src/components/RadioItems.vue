<script setup lang="ts">
import { useId } from 'vue';
import Label from './ui/label/Label.vue';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const model = defineModel<string>();
defineProps<{ items: { value: string, label: string }[] }>();

const id = useId();

</script>
<template>
  <RadioGroup v-model="model" class="flex gap-4">
    <div v-for="item in items" :key="item.value" class="flex items-center space-x-1">
      <RadioGroupItem :id="`${id}-${item.value}`" :value="item.value" />
      <Label :for="`${id}-${item.value}`">{{ item.label }}</Label>
    </div>
  </RadioGroup>
</template>
