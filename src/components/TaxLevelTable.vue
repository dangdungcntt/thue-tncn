<script setup lang="ts">
import { useTaxLevelRows } from '@/composables/tax';
import TaxLevelRowElement from './TaxLevelRowElement.vue';
import { TaxConfig2025, TaxConfig2026 } from '@/config';
import { computed } from 'vue';
import type { TaxLevelRow } from '@/model';

const props = defineProps<{
  monthlyTaxSalary: number,
  monthlyTaxSalary2026: number
}>()

const { taxLevelRows } = useTaxLevelRows(TaxConfig2025, () => props.monthlyTaxSalary);
const { taxLevelRows: taxLevelRows2026 } = useTaxLevelRows(TaxConfig2026, () => props.monthlyTaxSalary2026);

const convertedtaxLevelRows2026 = computed(() => {
  const results: TaxLevelRow[] = [];

  taxLevelRows2026.value.forEach((taxLevel, index) => {
    results.push(taxLevel);
    if (index <= 1 || index == taxLevelRows2026.value.length - 1) {
      results.push({
        taxLevel: {
          min: 0,
          max: 0,
          percent: 0
        }
      });
    }
  });

  return results;
})


function getRowSpan(index: number) {
  return convertedtaxLevelRows2026.value[index + 1]!.taxLevel.percent == 0 ? 2 : 1
}

</script>
<template>
  <div class="relative overflow-x-auto rounded-base border border-default">
    <table class="text-left w-full min-w-[900px]">
      <thead class="bg-neutral-secondary-soft border-b border-default text-center">
        <tr class="border-b border-default">
          <th class="p-2 border-r" colspan="4">Hiện hành</th>
          <th class="p-2" colspan="4">Luật thuế TNCN sửa đổi 2025</th>
        </tr>
        <tr>
          <th class="border-r p-2">Bậc</th>
          <th class="border-r p-2">Phần TNTT/năm <br>(triệu đồng)</th>
          <th class="border-r p-2">Phần TNTT/tháng <br>(triệu đồng)</th>
          <th class="border-r p-2">Thuế suất <br>(%)</th>
          <th class="border-r p-2">Bậc</th>
          <th class="border-r p-2">Phần TNTT/năm <br>(triệu đồng)</th>
          <th class="border-r p-2">Phần TNTT/tháng <br>(triệu đồng)</th>
          <th class="p-2">Thuế suất <br>(%)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(taxLevelRow, index) in taxLevelRows" :key="index"
          class="hover:bg-gray-200 odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
          <TaxLevelRowElement :tax-level-row="taxLevelRow" :rowspan="1" :level="index + 1" border-right />

          <template v-if="convertedtaxLevelRows2026[index]!.taxLevel.percent != 0">
            <TaxLevelRowElement :taxLevelRow="convertedtaxLevelRows2026[index]!" :rowspan="getRowSpan(index)"
              :level="(index + 1) - Math.floor((index + 1) / 2.4)" />
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
