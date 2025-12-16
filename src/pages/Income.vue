<script setup lang="ts">
import { reactive } from "vue";
import { useIncomeCalculator } from "@/composables/income";
import { TaxConfig2025, TaxConfig2026 } from "@/config";
import type { IncomeInputForm } from "@/model";
import CompareLabel from "@/components/CompareLabel.vue";
import RuleText from "@/components/RuleText.vue";

const maskaOption = reactive({
  mask: "#,###,###,###,###,###,###",
  reversed: true
});

const SalaryModes = [
  { label: 'Gross', value: 'gross' },
  { label: 'Net', value: 'net' }
];
const InsuranceModes = [
  { label: 'Toàn bộ lương', value: 'full' },
  { label: 'Khác', value: 'custom' }
];

const state = reactive<IncomeInputForm>({
  salaryMode: 'net',
  totalSalary: '50000000',
  numberOfPeople: 0,
  insuranceMode: 'full',
  insuranceInput: '',
});

const { monthlyResultRows } = useIncomeCalculator(TaxConfig2025, state);
const { monthlyResultRows: monthlyResultRows2026 } = useIncomeCalculator(TaxConfig2026, state);

</script>

<template>
  <h1 class="text-center my-4 text-3xl font-medium">Tính lương Gross - Net</h1>
  <RuleText />

  <div class="grid grid-cols-12 gap-5 md:gap-14">
    <div class="col-span-12 lg:col-span-5">
      <h4 class="text-2xl font-medium my-2">Thông tin</h4>
      <div class="mb-3">
        <div class="mb-2">
          <label>
            Thu nhập
          </label>
          <template v-for="salaryMode in SalaryModes" :key="salaryMode.value">
            <label class="ml-2 mr-3">
              <input v-model="state.salaryMode" :value="salaryMode.value" class="form-check-input" type="radio">
              {{ salaryMode.label }}
            </label>
          </template>
        </div>
        <input class="w-full border px-3 py-1 rounded-sm" v-model="state.totalSalary" v-maska:[maskaOption]
          type="text" />
      </div>
      <div class="mb-3">
        <div class="mb-2">Số người phụ thuộc </div>
        <input class="w-full border px-3 py-1 rounded-sm" v-model="state.numberOfPeople" type="number">
      </div>
      <div class="mb-3">
        <div class="mb-2">
          <label>
            Bảo hiểm
          </label>
          <template v-for="insuranceMode in InsuranceModes" :key="insuranceMode.value">
            <label class="ml-2 mr-3">
              <input v-model="state.insuranceMode" :value="insuranceMode.value" class="form-check-input" type="radio">
              {{ insuranceMode.label }}
            </label>
          </template>
        </div>
        <input v-if="state.insuranceMode === 'custom'" class="w-full border px-3 py-1 rounded-sm"
          v-model="state.insuranceInput" v-maska:[maskaOption] type="text" />
      </div>
      <hr class="my-6">
      <h6 class="text-xl font-medium my-4">Thuế thu nhập cá nhân hàng tháng</h6>
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
            <td class="border p-2" :class="{ 'font-semibold': row.heading }">{{ row.label }}</td>
            <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
              <div v-if="row.compare">&nbsp;</div>
              {{ row.value }}
            </td>
            <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
              <div v-if="row.compare">
                <CompareLabel :left="row.value" :right="monthlyResultRows2026[i]!.value" :inverse="row.invertCompare" />
              </div>

              {{ monthlyResultRows2026[i]!.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
