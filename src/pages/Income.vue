<script setup lang="ts">
import { reactive } from "vue";
import { useIncomeCalculator } from "@/composables/income";
import { TaxConfig2025, TaxConfig2026 } from "@/config";
import { SalaryInsuranceModes, Zones, type IncomeInputForm } from "@/model";
import RuleText from "@/components/RuleText.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import MonthResultTable from "@/components/MonthResultTable.vue";
import TaxLevelTable from "@/components/TaxLevelTable.vue";
import InputCurrency from "@/components/InputCurrency.vue";

const SalaryModes = [
  { label: 'Gross', value: 'gross' },
  { label: 'Net', value: 'net' }
];

const state = reactive<IncomeInputForm>({
  salaryMode: 'net',
  salaryInput: '',
  numberOfDependent: 0,
  insuranceSalaryMode: 'full',
  insuranceSalaryInput: '',
  zone: 'I',
});

const { monthlyResultRows, monthlyTaxSalary } = useIncomeCalculator(TaxConfig2025, state);
const { monthlyResultRows: monthlyResultRows2026, monthlyTaxSalary: monthlyTaxSalary2026 } = useIncomeCalculator(TaxConfig2026, state);

</script>

<template>
  <h1 class="text-center my-4 text-3xl font-medium">Tính lương Gross - Net</h1>
  <RuleText />

  <div class="grid grid-cols-12 gap-5 md:gap-14">
    <div class="col-span-12 lg:col-span-5 space-y-3">
      <h4 class="text-2xl font-medium my-2">Thông tin</h4>
      <div>
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
        <InputCurrency v-model="state.salaryInput" />
      </div>
      <div>
        <div class="mb-2">Số người phụ thuộc </div>
        <input class="w-full border px-3 py-1 rounded-sm" v-model="state.numberOfDependent" type="number">
      </div>
      <div>
        <div class="mb-2">
          <label>
            Bảo hiểm
          </label>
          <template v-for="mode in SalaryInsuranceModes" :key="mode.value">
            <label class="ml-2 mr-3">
              <input v-model="state.insuranceSalaryMode" :value="mode.value" class="form-check-input" type="radio">
              {{ mode.label }}
            </label>
          </template>
        </div>
        <InputCurrency v-if="state.insuranceSalaryMode === 'custom'" v-model="state.insuranceSalaryInput" />
      </div>
      <div>
        <label>
          Vùng
          <InfoTooltip tooltip="Dùng để tính trần BHTN" />
        </label>
        <template v-for="zone in Zones" :key="zone">
          <label class="ml-2 mr-3">
            <input v-model="state.zone" :value="zone" class="form-check-input" type="radio">
            {{ zone }}
          </label>
        </template>
      </div>
    </div>
    <div class="col-span-12 lg:col-span-7">
      <hr class="my-6 lg:hidden">
      <h6 class="text-xl font-medium my-4">Thuế thu nhập cá nhân hàng tháng</h6>
      <MonthResultTable :monthly-result-rows="monthlyResultRows" :monthly-result-rows-2026="monthlyResultRows2026" />
    </div>
  </div>
  <div>
    <hr class="mt-6">
    <h6 class="text-xl font-medium my-4">Bảng thuế suất thuế thu nhập cá nhân
    </h6>
    <TaxLevelTable :monthly-tax-salary="monthlyTaxSalary" :monthly-tax-salary2026="monthlyTaxSalary2026" />
  </div>
</template>
