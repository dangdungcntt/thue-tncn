<script setup lang="ts">
import { reactive } from "vue";
import { useIncomeCalculator } from "@/composables/income";
import { TaxConfig2025, TaxConfig2026 } from "@/config";
import { SalaryInsuranceModes, Zones, type IncomeInputForm } from "@/model";
import RuleText from "@/components/RuleText.vue";
import MonthResultTable from "@/components/MonthResultTable.vue";
import TaxLevelTable from "@/components/TaxLevelTable.vue";
import InputCurrency from "@/components/InputCurrency.vue";
import RadioItems from "@/components/RadioItems.vue";
import MinSalaryTable from "@/components/MinSalaryTable.vue";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const InputModes = [
  { label: 'Gross', value: 'gross' },
  { label: 'Net', value: 'net' },
  { label: 'Thuế phải đóng', value: 'tax' },
];

const state = reactive<IncomeInputForm>({
  inputMode: 'net',
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
    <div class="col-span-12 lg:col-span-5 space-y-4">
      <h4 class="text-2xl font-medium my-2">Thông tin</h4>
      <div class="space-y-2">
        <div class="flex gap-3">
          <Label>
            Số tiền
          </Label>
          <RadioItems v-model="state.inputMode" :items="InputModes" />
        </div>
        <InputCurrency v-model="state.salaryInput" />
      </div>
      <div class="space-y-2">
        <Label>Số người phụ thuộc </Label>
        <Input v-model="state.numberOfDependent" type="number" />
      </div>
      <div class="space-y-2">
        <div class="flex gap-3">
          <Label>
            Bảo hiểm
          </Label>
          <RadioItems v-model="state.insuranceSalaryMode" :items="SalaryInsuranceModes" />
        </div>
        <InputCurrency v-if="state.insuranceSalaryMode === 'custom'" v-model="state.insuranceSalaryInput" />
      </div>
      <div class="flex gap-3">
        <Label>
          Vùng
        </Label>
        <RadioItems v-model="state.zone" :items="Zones" />
      </div>
      <div class="my-6 hidden lg:block">
        <h6 class="text-xl font-medium my-4">Bảng lương tối thiểu vùng</h6>
        <div class="italic mb-2">Dùng làm căn cứ xác định mức đóng BHTN tối đa.</div>
        <MinSalaryTable />
      </div>
    </div>
    <div class="col-span-12 lg:col-span-7">
      <hr class="my-4 lg:hidden">
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
