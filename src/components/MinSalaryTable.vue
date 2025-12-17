<script setup lang="ts">
import { Zones } from '@/model';
import { TaxConfig2025, TaxConfig2026 } from '@/config';
import { formatNumber } from '@/libs/utils';

</script>
<template>
  <table class="border border-collapse w-full text-left">
    <thead>
      <tr>
        <th class="border p-2">Vùng</th>
        <th class="border p-2 text-center">
          2025<br />(đồng)
        </th>
        <th class="border p-2 text-center">
          2026<br />(đồng)
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in Zones" :key="i" class="hover:bg-gray-200" :class="{ 'bg-gray-100': i % 2 == 0 }">
        <td class="border p-2 font-semibold">
          Vùng {{ row.label }}
        </td>
        <td class="border p-2 text-center">
          {{ formatNumber(TaxConfig2025.minMonthlySalaryByZone[row.value]) }}
        </td>
        <td class="border p-2 text-center">
          {{ formatNumber(TaxConfig2026.minMonthlySalaryByZone[row.value]) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
