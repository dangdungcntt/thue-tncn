<script setup lang="ts">
import type { ResultRow } from '@/model';
import CompareLabel from './CompareLabel.vue';
import InfoTooltip from './InfoTooltip.vue';

defineProps<{
  monthlyResultRows: ResultRow[],
  monthlyResultRows2026: ResultRow[],
}>()
</script>
<template>
  <table class="border border-collapse w-full text-left">
    <thead>
      <tr>
        <th class="border p-2"></th>
        <th class="border p-2 text-center">
          KQT 2025
          <div class="text-xs font-normal">Tháng 3/2026</div>
        </th>
        <th class="border p-2 text-center">
          KQT 2026
          <div class="text-xs font-normal">Tháng 3/2027</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in monthlyResultRows" :key="i" class="hover:bg-gray-200"
        :class="{ 'bg-gray-100': i % 2 == 0 }">
        <td class="border p-2" :class="{ 'font-semibold': row.heading }">
          {{ row.label }}
          <InfoTooltip v-if="row.tooltip" :tooltip="row.tooltip" />
        </td>
        <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
          <div v-if="row.compare">&nbsp;</div>
          <InfoTooltip v-if="row.value_tooltip" :tooltip="row.value_tooltip" />
          {{ row.value }}
        </td>
        <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
          <div v-if="row.compare">
            <CompareLabel :left="row.value" :right="monthlyResultRows2026[i]!.value" :inverse="row.invertCompare" />
          </div>

          <InfoTooltip v-if="monthlyResultRows2026[i]!.value_tooltip"
            :tooltip="monthlyResultRows2026[i]!.value_tooltip" />
          {{ monthlyResultRows2026[i]!.value }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
