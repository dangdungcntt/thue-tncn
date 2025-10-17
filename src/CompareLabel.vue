<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  left: string;
  right: string;
  inverse?: boolean
}>()

const rate = computed(() => {
  const leftValue = Number(props.left.replace(/,/g, ''))
  const rightValue = Number(props.right.replace(/,/g, ''))

  if (!leftValue) {
    return 0
  }

  return ((rightValue - leftValue) / leftValue) * 100
})

</script>
<template>
  <span :class="`text-xs ${inverse ? 'text-red-600' : 'text-green-600'}`" v-if="rate > 0">↑ Tăng {{ Math.round(rate) ==
    rate ? rate : rate.toFixed(1)
  }}%</span>
  <span :class="`text-xs ${inverse ? 'text-green-600' : 'text-red-600'}`" v-else-if="rate < 0">↓ Giảm {{
    Math.round(rate) == rate ? Math.abs(rate) : Math.abs(rate).toFixed(1) }}%</span>
  <span v-else>&nbsp;</span>
</template>
