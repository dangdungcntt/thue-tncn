<script setup lang="ts">
import { computed, reactive } from "vue";
import { useTaxCalculator } from "../composables/tax";
import { TaxConfig2025, TaxConfig2026 } from "../config";
import { TaxInputForm, TaxRate } from "../model";
import CompareLabel from "../components/CompareLabel.vue";
import { formatNumber } from "../libs/utils";

const _1M = 1000000;

const maskaOption = reactive({
  mask: "#,###,###,###,###,###,###",
  reversed: true
});

const SalaryModes = [
  { label: 'Theo tháng', value: 'month' },
  { label: 'Theo năm', value: 'year' }
];
const InsuranceModes = [
  { label: 'Mức lương đóng bảo hiểm', value: 'salary' },
  { label: 'Tiền đã nộp', value: 'payed' }
];

const state = reactive<TaxInputForm>({
  salaryMode: 'month',
  totalSalary: '',
  numberOfPeople: 0,
  insuranceMode: 'salary',
  insuranceInput: '',
  payedTax: ''
});

const showMonthlyTax = computed(() => {
  return state.salaryMode === 'month' && state.insuranceMode == 'salary';
});

const { resultRows, monthlyResultRows, taxRateRows, getTaxRateValue } = useTaxCalculator(TaxConfig2025, state);
const { resultRows: resultRows2026, monthlyResultRows: monthlyResultRows2026, taxRateRows: taxRateRows2026 } = useTaxCalculator(TaxConfig2026, state);

const convertedtaxRateRows2026 = computed(() => {
  const results: TaxRate[] = [];

  taxRateRows2026.value.forEach((taxRate, index) => {
    results.push(taxRate);
    if (index == 0 || index == 1) {
      results.push({
        min: 0,
        max: 0,
        rate: 0
      });
    }
  });

  results.push({
    min: 0,
    max: 0,
    rate: 0
  });

  return results;
})

</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-center my-4 text-3xl font-medium">Tính thuế TNCN</h1>
    <div class="text-center my-4">(Cập nhật theo Nghị quyết 110/2025/UBTVQH15 và Luật thuế TNCN sửa đổi 2025)</div>
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
          <input class="w-full border px-3 py-1 rounded-sm" v-model="state.insuranceInput" v-maska:[maskaOption]
            type="text" />
        </div>
        <div class="mb-3">
          <label>Thuế đã khấu trừ</label>
          <input class="w-full border px-3 py-1 rounded-sm" v-model="state.payedTax" v-maska:[maskaOption]
            type="text" />
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
                <td class="border p-2" :class="{ 'font-semibold': row.heading }">{{ row.label }}</td>
                <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
                  <div v-if="row.compare">&nbsp;</div>
                  {{ row.value }}
                </td>
                <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
                  <div v-if="row.compare">
                    <CompareLabel :left="row.value" :right="monthlyResultRows2026[i].value"
                      :inverse="row.invertCompare" />
                  </div>

                  {{ monthlyResultRows2026[i].value }}
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
            <tr v-for="(row, i) in resultRows" :key="i" class="hover:bg-gray-200"
              :class="{ 'bg-gray-100': i % 2 == 0 }">
              <td class="border p-2" :class="{ 'font-semibold': row.heading }">{{ row.label }}</td>
              <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
                <div v-if="row.compare">&nbsp;</div>
                {{ row.value }}
              </td>
              <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">
                <div v-if="row.compare">
                  <CompareLabel :left="row.value" :right="resultRows2026[i].value" :inverse="row.invertCompare" />
                </div>
                {{ resultRows2026[i].value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <hr class="mt-6">
      <h6 class="text-xl font-medium my-4">Bảng thuế suất thuế thu nhập cá nhân:
      </h6>
      <div class="relative overflow-x-auto rounded-base border border-default">
        <table class="text-left w-full min-w-[992px]">
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
            <tr v-for="(taxRate, index) in taxRateRows" :key="index"
              class="hover:bg-gray-200 odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
              <td class="border-r p-2 text-center">{{ index + 1 }}</td>
              <td class="border-r p-2 capitalize">
                <span v-if="taxRate.min">Trên {{ (taxRate.min / _1M) }}</span> <span v-if="taxRate.max">đến {{
                  (taxRate.max /
                    _1M)
                }}</span>
              </td>
              <td class="border-r p-2 capitalize">
                <span v-if="taxRate.min">Trên {{ (taxRate.min / 12 / _1M) }}</span> <span v-if="taxRate.max">đến {{
                  (taxRate.max / 12 / _1M)
                  }}</span>
              </td>
              <td class="text-center border-r p-2">{{ taxRate.rate }} <span
                  v-if="showMonthlyTax && getTaxRateValue(taxRate) > 0"><br>~{{
                    formatNumber(getTaxRateValue(taxRate)) }}</span></td>

              <template v-if="convertedtaxRateRows2026[index].rate != 0">
                <td class="border-r p-2 text-center" :rowspan="convertedtaxRateRows2026[index + 1].rate == 0 ? 2 : 1">{{
                  (index + 1)
                  -
                  (Math.floor((index + 1) / 2.4)) }}
                </td>
                <td class="border-r p-2 capitalize" :rowspan="convertedtaxRateRows2026[index + 1].rate == 0 ? 2 : 1">
                  <span v-if="convertedtaxRateRows2026[index].min">
                    Trên {{
                      formatNumber(convertedtaxRateRows2026[index].min / _1M) }}
                  </span> <span v-if="convertedtaxRateRows2026[index].max">đến {{
                    formatNumber(convertedtaxRateRows2026[index].max /
                      _1M)
                  }}</span>
                </td>
                <td class="border-r p-2 capitalize" :rowspan="convertedtaxRateRows2026[index + 1].rate == 0 ? 2 : 1">
                  <span v-if="convertedtaxRateRows2026[index].min">Trên {{
                    (convertedtaxRateRows2026[index].min / 12 / _1M) }}</span> <span
                    v-if="convertedtaxRateRows2026[index].max">đến
                    {{
                      formatNumber(convertedtaxRateRows2026[index].max / 12 / _1M)
                    }}</span>
                </td>
                <td class="text-center p-2" :rowspan="convertedtaxRateRows2026[index + 1].rate == 0 ? 2 : 1">{{
                  convertedtaxRateRows2026[index].rate }} <span
                    v-if="showMonthlyTax && getTaxRateValue(convertedtaxRateRows2026[index]) > 0"><br>~{{
                      formatNumber(getTaxRateValue(convertedtaxRateRows2026[index])) }}</span></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
