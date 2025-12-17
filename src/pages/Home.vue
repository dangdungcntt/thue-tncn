<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useTaxCalculator, useTaxLevelRows } from "@/composables/tax";
import { TaxConfig2025, TaxConfig2026 } from "@/config";
import { SalaryInsuranceModes, Zones, type TaxInputForm, type TaxLevelRow } from "@/model";
import CompareLabel from "@/components/CompareLabel.vue";
import TaxLevelRowElement from "@/components/TaxLevelRowElement.vue";
import InputCurrency from "@/components/InputCurrency.vue";
import RuleText from "@/components/RuleText.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import MonthResultTable from "@/components/MonthResultTable.vue";
import RadioItems from "@/components/RadioItems.vue";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SalaryModes = [
  { label: 'Theo tháng', value: 'month' },
  { label: 'Theo năm', value: 'year' }
];

const state = reactive<TaxInputForm>({
  salaryMode: 'month',
  salaryInput: '',
  numberOfDependent: 0,
  insuranceMode: 'salary',
  insuranceSalaryMode: 'full',
  insuranceInput: '',
  payedTaxInput: '',
  zone: 'I',
});

watch(() => state.salaryMode, () => {
  if (state.salaryMode == 'month') {
    state.insuranceMode = 'salary';
  }
})

const InsuranceModes = computed(() => {
  if (state.salaryMode == 'year') {
    return [
      { label: 'Mức đóng', value: 'salary' },
      { label: 'Tiền đã nộp', value: 'payed' }
    ];
  }
  return [];
});

const showMonthlyTax = computed(() => {
  return state.salaryMode === 'month' && state.insuranceMode == 'salary';
});

const { resultRows, monthlyResultRows, monthlyTaxSalary } = useTaxCalculator(TaxConfig2025, state);
const { resultRows: resultRows2026, monthlyResultRows: monthlyResultRows2026, monthlyTaxSalary: monthlyTaxSalary2026 } = useTaxCalculator(TaxConfig2026, state);
const { taxLevelRows } = useTaxLevelRows(TaxConfig2025, monthlyTaxSalary);
const { taxLevelRows: taxLevelRows2026 } = useTaxLevelRows(TaxConfig2026, monthlyTaxSalary2026);

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
  <h1 class="text-center my-4 text-3xl font-medium">Tính thuế TNCN</h1>
  <RuleText />

  <div class="grid grid-cols-12 gap-5 md:gap-14">
    <div class="col-span-12 lg:col-span-5 space-y-4">
      <h4 class="text-2xl font-medium my-2">Thông tin</h4>
      <div class="space-y-2">
        <div class="flex gap-3">
          <Label>
            Thu nhập
          </Label>
          <RadioItems v-model="state.salaryMode" :items="SalaryModes" />
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

          <RadioItems v-if="InsuranceModes.length" v-model="state.insuranceMode" :items="InsuranceModes" />
          <RadioItems v-if="showMonthlyTax" v-model="state.insuranceSalaryMode" :items="SalaryInsuranceModes" />
        </div>
        <InputCurrency v-if="!showMonthlyTax || state.insuranceSalaryMode == 'custom'" v-model="state.insuranceInput" />
      </div>
      <div v-if="showMonthlyTax" class="flex gap-3">
        <Label>
          Vùng
          <InfoTooltip tooltip="Dùng để tính trần BHTN" />
        </Label>
        <RadioItems v-model="state.zone" :items="Zones" />
      </div>
      <div>
        <div class="mb-2">
          <label>Thuế đã khấu trừ</label>
        </div>
        <InputCurrency v-model="state.payedTaxInput" />
      </div>
      <template v-if="showMonthlyTax">
        <hr class="my-6">
        <h6 class="text-xl font-medium my-4">Thuế thu nhập cá nhân hàng tháng</h6>
        <MonthResultTable :monthly-result-rows="monthlyResultRows" :monthly-result-rows-2026="monthlyResultRows2026" />
      </template>
    </div>
    <div class="col-span-12 lg:col-span-7">
      <hr class="my-6 lg:hidden">
      <h4 class="text-2xl font-medium my-4">Kết quả quyết toán thuế cả năm</h4>
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
          <tr v-for="(row, i) in resultRows" :key="i" class="hover:bg-gray-200" :class="{ 'bg-gray-100': i % 2 == 0 }">
            <td class="border p-2" :class="{ 'font-semibold': row.heading }">{{ row.label }}</td>
            <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
              <div v-if="row.compare">&nbsp;</div>
              {{ row.value }}
            </td>
            <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
              <div v-if="row.compare">
                <CompareLabel :left="row.value" :right="resultRows2026[i]!.value" :inverse="row.invertCompare" />
              </div>
              {{ resultRows2026[i]!.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div>
    <hr class="mt-6">
    <h6 class="text-xl font-medium my-4">Bảng thuế suất thuế thu nhập cá nhân
    </h6>
    <div class="relative overflow-x-auto rounded-base border border-default">
      <table class="text-left w-full min-w-225">
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
  </div>
</template>
