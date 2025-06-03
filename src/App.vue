<script setup lang="ts">
import { computed, reactive } from "vue";
import { GetTax, TaxRates } from "./tax";
import { TaxRate } from "./model";

const _1M = 1000000;

const taxRateRows: TaxRate[] = [];
for (let i = 0; i < TaxRates.length; i++) {
  taxRateRows.push({
    min: TaxRates[i].min,
    rate: TaxRates[i].rate,
    max: i < TaxRates.length - 1 ? TaxRates[i + 1].min : 0
  });
}
const formatNumber = (number: number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

const taxConfig = {
  selfReduce: 11000000,
  peopleReduce: 4400000,
  insuranceRate: 10.5
};

const state = reactive({
  salaryMode: 'month',
  totalSalary: '',
  numberOfPeople: 0,
  insuranceMode: 'salary',
  insuranceInput: '',
  payedTax: ''
});

const cTotalSalary = computed(() => {
  return Math.max(Number(state.totalSalary.replace(/,/g, '')), 0);
});

const cInsuranceInput = computed(() => {
  return Math.max(Number(state.insuranceInput.replace(/,/g, '')), 0);
});

const cPayedTax = computed(() => {
  return Math.max(Number(state.payedTax.replace(/,/g, '')), 0);
});


const totalSalaryOfYear = computed(() => {
  if (state.salaryMode === 'month') {
    return cTotalSalary.value * 12;
  }

  return cTotalSalary.value;
});

const selfReduceSalary = taxConfig.selfReduce * 12;
const peopleReduceSalary = computed(() => {
  return state.numberOfPeople * taxConfig.peopleReduce * 12;
});

const totalReduceSalary = computed(() => {
  return selfReduceSalary + peopleReduceSalary.value;
});

const payedInsurance = computed(() => {
  if (state.insuranceMode === 'salary') {
    return Math.round(cInsuranceInput.value * 12 * taxConfig.insuranceRate / 100);
  }
  return cInsuranceInput.value;
});

const taxSalary = computed(() => {
  return Math.max(totalSalaryOfYear.value - totalReduceSalary.value - payedInsurance.value, 0);
});

const totalTax = computed(() => {
  return GetTax(taxSalary.value);
});

const remainingTax = computed(() => {
  return totalTax.value - cPayedTax.value;
});

const showMonthlyTax = computed(() => {
  return state.salaryMode === 'month' && state.insuranceMode == 'salary';
});

const monthlyInsurance = computed(() => {
  return Math.round(cInsuranceInput.value * taxConfig.insuranceRate / 100);
});

const monthlyTaxSalary = computed(() => {
  return Math.max(cTotalSalary.value - (totalReduceSalary.value / 12) - monthlyInsurance.value, 0);
});

const getTaxRateValue = (taxRate: TaxRate) => {
  let currentLevelTaxSalary = (monthlyTaxSalary.value - taxRate.min / 12);
  if (taxRate.max) {
    currentLevelTaxSalary = Math.min(
      (taxRate.max - taxRate.min) / 12,
      currentLevelTaxSalary
    )
  }

  return currentLevelTaxSalary * taxRate.rate / 100;
}

const resultRows = computed(() => {
  return [
    {
      label: 'Tổng Thu nhập chịu thuế (1)',
      value: formatNumber(totalSalaryOfYear.value),
      heading: true,
    },
    {
      label: 'Giảm trừ gia cảnh (2)',
      value: formatNumber(totalReduceSalary.value),
      heading: true,
    },
    {
      label: `Bản thân (${formatNumber(taxConfig.selfReduce)}/tháng)`,
      value: formatNumber(selfReduceSalary),
      heading: false,
    },
    {
      label: `Người phụ thuộc (${formatNumber(taxConfig.peopleReduce)}/tháng)`,
      value: formatNumber(peopleReduceSalary.value),
      heading: false,
    },
    {
      label: 'Bảo hiểm đã đóng (3)',
      value: formatNumber(payedInsurance.value),
      heading: true,
    },
    {
      label: 'Tổng thu nhập tính thuế (4) = (1) - (2) - (3)',
      value: formatNumber(taxSalary.value),
      heading: true,
    },
    {
      label: 'Tổng thuế phải đóng (5)',
      value: formatNumber(totalTax.value),
      heading: true,
    },
    {
      label: 'Thuế đã khấu trừ (6)',
      value: formatNumber(cPayedTax.value),
      heading: true,
    },
    {
      label: remainingTax.value > 0 ? 'Thuế còn phải đóng (7) = (5) - (6)' : 'Thuế được nhận lại (7) = (6) - (5)',
      value: formatNumber(Math.abs(remainingTax.value)),
      heading: true,
    },
  ];
});

const monthlyResultRows = computed(() => {
  return [
    {
      label: 'Thu nhập (1)',
      value: formatNumber(cTotalSalary.value),
      heading: true,
    },
    {
      label: 'Giảm trừ gia cảnh (2)',
      value: formatNumber(totalReduceSalary.value / 12),
      heading: true,
    },
    {
      label: 'Bảo hiểm (3)',
      value: formatNumber(monthlyInsurance.value),
      heading: true,
    },
    {
      label: 'Thu nhập tính thuế (4) = (1) - (2) - (3)',
      value: formatNumber(monthlyTaxSalary.value),
      heading: true,
    },
    {
      label: 'Thuế phải đóng (5)',
      value: formatNumber(GetTax(monthlyTaxSalary.value, 'month')),
      heading: true,
    },
    {
      label: 'Thực nhận (6) = (1) - (3) - (5)',
      value: formatNumber(cTotalSalary.value - GetTax(monthlyTaxSalary.value, 'month') -
        monthlyInsurance.value),
      heading: true,
    },
  ];
});

</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-center my-4 text-3xl font-medium">Tính thuế TNCN</h1>
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
          <tbody>
            <tr v-for="(row, i) in resultRows" :key="i" class="hover:bg-gray-200"
              :class="{ 'bg-gray-100': i % 2 == 0 }">
              <td class="border p-2" :class="{ 'font-semibold': row.heading }">{{ row.label }}</td>
              <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">{{ row.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-span-12 md:col-span-5">
        <template v-if="showMonthlyTax">
          <hr>
          <h6 class="text-xl font-medium my-2">Thuế thu nhập cá nhân hàng tháng</h6>
          <table class="border border-collapse w-full text-left">
            <tbody>
              <tr v-for="(row, i) in monthlyResultRows" :key="i" class="hover:bg-gray-200"
                :class="{ 'bg-gray-100': i % 2 == 0 }">
                <td class="border p-2" :class="{ 'font-semibold': row.heading }">{{ row.label }}</td>
                <td class="border p-2 text-end" :class="{ 'font-semibold': row.heading }">{{ row.value }}</td>
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
