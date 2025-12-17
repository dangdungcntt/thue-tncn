<script setup lang="ts">
import { InfoIcon } from 'lucide-vue-next';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

defineProps<{ tooltip: string }>()
</script>
<template>
  <Popover>
    <PopoverTrigger as-child>
      <InfoIcon class="size-4 inline text-blue-500 mb-0.5" />
    </PopoverTrigger>
    <PopoverContent>
      <p>{{ tooltip }}</p>
    </PopoverContent>
  </Popover>
</template>
