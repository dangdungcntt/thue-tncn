<script setup lang="ts">
import { InfoIcon } from 'lucide-vue-next';
import Tooltip from './ui/tooltip/Tooltip.vue';
import TooltipProvider from './ui/tooltip/TooltipProvider.vue';
import TooltipTrigger from './ui/tooltip/TooltipTrigger.vue';
import TooltipContent from './ui/tooltip/TooltipContent.vue';

defineProps<{ tooltip: string }>()
</script>
<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <InfoIcon class="size-4 inline text-blue-500 mb-0.5" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ tooltip }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
