<script setup lang="ts">
import { formatNumber } from '../libs/utils';
import { TaxRateRow } from '../model';

const _1M = 1000000;

defineProps<{
  taxRateRow: TaxRateRow,
  level: number,
  rowspan?: number,
}>();
</script>
<template>
  <td class="border-r p-2 text-center" :rowspan="rowspan">{{ level }}</td>
  <td class="border-r p-2 capitalize" :rowspan="rowspan">
    <span v-if="taxRateRow.taxRate.min">Trên {{ formatNumber(taxRateRow.taxRate.min / _1M) }}</span>
    <span v-if="taxRateRow.taxRate.max">đến {{ formatNumber(taxRateRow.taxRate.max! / _1M) }}</span>
  </td>
  <td class="border-r p-2 capitalize" :rowspan="rowspan">
    <span v-if="taxRateRow.taxRate.min">Trên {{ (taxRateRow.taxRate.min / 12 / _1M) }}</span>
    <span v-if="taxRateRow.taxRate.max">đến {{ formatNumber(taxRateRow.taxRate.max! / 12 / _1M) }}</span>
  </td>
  <td class="text-center p-2" :rowspan="rowspan">
    {{ taxRateRow.taxRate.rate }}
    <span v-if="(taxRateRow.monthlyTaxValue || 0) > 0"><br>~{{ formatNumber(taxRateRow.monthlyTaxValue!) }}</span>
  </td>
</template>
