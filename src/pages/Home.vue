<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useTaxCalculator, useTaxRateRows } from "@/composables/tax";
import { TaxConfig2025, TaxConfig2026 } from "@/config";
import type { TaxInputForm, TaxRateRow } from "@/model";
import CompareLabel from "@/components/CompareLabel.vue";
import TaxRateRowElement from "@/components/TaxRateRowElement.vue";
import InputCurrency from "@/components/InputCurrency.vue";
import RuleText from "@/components/RuleText.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";

const SalaryModes = [
  { label: 'Theo tháng', value: 'month' },
  { label: 'Theo năm', value: 'year' }
];

const SalaryInsuranceModes = [
  { label: 'Toàn bộ lương', value: 'full' },
  { label: 'Khác', value: 'custom' }
];
const Zones = ["I", "II", "III", "IV"]

const state = reactive<TaxInputForm>({
  salaryMode: 'month',
  totalSalary: '63000000',
  numberOfPeople: 0,
  insuranceMode: 'salary',
  slaryForInsuranceMode: 'full',
  insuranceInput: '',
  payedTax: '',
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
const { taxRateRows } = useTaxRateRows(TaxConfig2025, monthlyTaxSalary);
const { taxRateRows: taxRateRows2026 } = useTaxRateRows(TaxConfig2026, monthlyTaxSalary2026);

const convertedtaxRateRows2026 = computed(() => {
  const results: TaxRateRow[] = [];

  taxRateRows2026.value.forEach((taxRate, index) => {
    results.push(taxRate);
    if (index <= 1 || index == taxRateRows2026.value.length - 1) {
      results.push({
        taxRate: {
          min: 0,
          max: 0,
          rate: 0
        }
      });
    }
  });

  return results;
})

function getRowSpan(index: number) {
  return convertedtaxRateRows2026.value[index + 1]!.taxRate.rate == 0 ? 2 : 1
}

</script>

<template>
  <h1 class="text-center my-4 text-3xl font-medium">Tính thuế TNCN</h1>
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
        <InputCurrency v-model="state.totalSalary" />
      </div>
      <div>
        <div class="mb-2">Số người phụ thuộc </div>
        <input class="w-full border px-3 py-1 rounded-sm" v-model="state.numberOfPeople" type="number">
      </div>
      <div class="space-y-2">
        <div>
          <label>
            Bảo hiểm
          </label>
          <template v-if="InsuranceModes.length" v-for="insuranceMode in InsuranceModes" :key="insuranceMode.value">
            <label class="ml-2 mr-3">
              <input v-model="state.insuranceMode" :value="insuranceMode.value" class="form-check-input" type="radio">
              {{ insuranceMode.label }}
            </label>
          </template>
          <label v-if="showMonthlyTax" v-for="mode in SalaryInsuranceModes" :key="mode.value" class="ml-2 mr-3">
            <input v-model="state.slaryForInsuranceMode" :value="mode.value" class="form-check-input" type="radio">
            {{ mode.label }}
          </label>
        </div>
        <div>

        </div>
        <InputCurrency v-if="!showMonthlyTax || state.slaryForInsuranceMode == 'custom'"
          v-model="state.insuranceInput" />
      </div>
      <div v-if="showMonthlyTax">
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
      <div>
        <div class="mb-2">
          <label>Thuế đã khấu trừ</label>
        </div>
        <InputCurrency v-model="state.payedTax" />
      </div>
      <template v-if="showMonthlyTax">
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
                  <CompareLabel :left="row.value" :right="monthlyResultRows2026[i]!.value"
                    :inverse="row.invertCompare" />
                </div>

                <InfoTooltip v-if="monthlyResultRows2026[i]!.value_tooltip"
                  :tooltip="monthlyResultRows2026[i]!.value_tooltip" />
                {{ monthlyResultRows2026[i]!.value }}
              </td>
            </tr>
          </tbody>
        </table>
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
          <tr v-for="(taxRateRow, index) in taxRateRows" :key="index"
            class="hover:bg-gray-200 odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
            <TaxRateRowElement :tax-rate-row="taxRateRow" :rowspan="1" :level="index + 1" border-right />

            <template v-if="convertedtaxRateRows2026[index]!.taxRate.rate != 0">
              <TaxRateRowElement :tax-rate-row="convertedtaxRateRows2026[index]!" :rowspan="getRowSpan(index)"
                :level="(index + 1) - Math.floor((index + 1) / 2.4)" />
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
