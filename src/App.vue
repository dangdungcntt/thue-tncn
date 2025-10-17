<script setup lang="ts">
import { computed, reactive } from "vue";
import { formatNumber, useTaxCalculator } from "./composable";
import { TaxConfig2025, TaxConfig2026 } from "./config";
import { InputForm } from "./model";
import CompareLabel from "./CompareLabel.vue";

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

const state = reactive<InputForm>({
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
const { resultRows: resultRows2026, monthlyResultRows: monthlyResultRows2026 } = useTaxCalculator(TaxConfig2026, state);

</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-center my-4 text-3xl font-medium">Tính thuế TNCN</h1>
    <div class="text-center my-4">(Cập nhật theo quyết định ngày 17/10/2025
      của Ủy ban Thường vụ Quốc hội)</div>
    <div class="grid grid-cols-12 gap-5 md:gap-10">
      <div class="col-span-12 md:col-span-7">
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
        <hr>
        <h4 class="text-2xl font-medium my-2">Kết quả quyết toán thuế cả năm</h4>
        <table class="border border-collapse w-full text-left">
          <thead>
            <th class="border p-2"></th>
            <th class="border p-2 text-center">
              KQT 2025
              <div class="text-xs font-normal">Tháng 3/2026</div>
            </th>
            <th class="border p-2 text-center">
              KQT 2026
              <div class="text-xs font-normal">Tháng 3/2027</div>
            </th>
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
                  <CompareLabel :left="row.value" :right="resultRows2026[i].value" />
                </div>
                {{ resultRows2026[i].value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-span-12 md:col-span-5">
        <template v-if="showMonthlyTax">
          <hr>
          <h6 class="text-xl font-medium my-2">Thuế thu nhập cá nhân hàng tháng</h6>
          <table class="border border-collapse w-full text-left">
            <thead>
              <th class="border p-2"></th>
              <th class="border p-2 text-center">
                KQT 2025
                <div class="text-xs font-normal">Tháng 3/2026</div>
              </th>
              <th class="border p-2 text-center">
                KQT 2026
                <div class="text-xs font-normal">Tháng 3/2027</div>
              </th>
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
                    <CompareLabel :left="row.value" :right="monthlyResultRows2026[i].value" />
                  </div>

                  {{ monthlyResultRows2026[i].value }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <hr class="mt-4">
        <h6 class="text-xl font-medium my-2">Bảng thuế suất thuế thu nhập cá nhân hiện hành:</h6>
        <table class="text-left">
          <thead>
            <tr>
              <th class="border p-2">Bậc thuế</th>
              <th class="border p-2">Phần thu nhập tính thuế/năm (triệu đồng)</th>
              <th class="border p-2">Phần thu nhập tính thuế/tháng (triệu đồng)</th>
              <th class="border p-2">Thuế suất (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(taxRate, index) in taxRateRows" :key="index" class="hover:bg-gray-200"
              :class="{ 'bg-gray-100': index % 2 == 0 }">
              <td class="border p-2">{{ index + 1 }}</td>
              <td class="border p-2">Trên {{ (taxRate.min / _1M) }} <span v-if="taxRate.max">đến {{ (taxRate.max / _1M)
                  }}</span>
              </td>
              <td class="border p-2">Trên {{ (taxRate.min / 12 / _1M) }} <span v-if="taxRate.max">đến {{
                (taxRate.max / 12 / _1M)
                  }}</span></td>
              <td class="text-center border p-2">{{ taxRate.rate }} <span
                  v-if="showMonthlyTax && getTaxRateValue(taxRate) > 0"><br>~{{
                    formatNumber(getTaxRateValue(taxRate)) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
