<script setup lang="ts">
import { formatNumber } from '../libs/utils';
import type { TaxLevelRow } from '../model';

const _1M = 1000000;

defineProps<{
  taxLevelRow: TaxLevelRow,
  level: number,
  rowspan?: number,
  borderRight?: boolean
}>();
</script>
<template>
  <td class="border-r p-2 text-center" :rowspan="rowspan">{{ level }}</td>
  <td class="border-r p-2 capitalize" :rowspan="rowspan">
    <span v-if="taxLevelRow.taxLevel.min">Trên {{ formatNumber(taxLevelRow.taxLevel.min / _1M) }}&nbsp;</span>
    <span v-if="taxLevelRow.taxLevel.max">đến {{ formatNumber(taxLevelRow.taxLevel.max! / _1M) }}</span>
  </td>
  <td class="border-r p-2 capitalize" :rowspan="rowspan">
    <span v-if="taxLevelRow.taxLevel.min">Trên {{ (taxLevelRow.taxLevel.min / 12 / _1M) }}&nbsp;</span>
    <span v-if="taxLevelRow.taxLevel.max">đến {{ formatNumber(taxLevelRow.taxLevel.max! / 12 / _1M) }}</span>
  </td>
  <td class="text-center p-2" :class="{ 'border-r': borderRight }" :rowspan="rowspan">
    {{ taxLevelRow.taxLevel.percent }}
    <span v-if="(taxLevelRow.monthlyTaxValue || 0) > 0"><br>~{{ formatNumber(taxLevelRow.monthlyTaxValue!) }}</span>
  </td>
</template>
