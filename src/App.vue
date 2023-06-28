<script setup>
import { computed, reactive } from "vue";
import { GetTax, TaxRates } from "./tax.js";

const _1M = 1000000;

const taxRateRows = [];
for (let i = 0; i < TaxRates.length; i++) {
  taxRateRows.push({
    label: TaxRates[i].label,
    min: TaxRates[i].min,
    rate: TaxRates[i].rate,
    max: i < TaxRates.length - 1 ? TaxRates[i + 1].min : 0
  });
}
const formatNumber = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

const getTaxRateValue = (taxRate) => {
  return Math.min((taxRate.max - taxRate.min) / 12 * taxRate.rate / 100, taxRate.rate * (monthlyTaxSalary.value - taxRate.min / 12) / 100)
}

</script>

<template>
  <div class="container">
    <h1 class="text-center my-4">Tính thuế TNCN</h1>
    <div class="row">
      <div class="col-lg-7">
        <h4>Thông tin</h4>
        <div class="mb-3">
          <label class="form-label">
            Thu nhập
          </label>

          <div v-for="salaryMode in SalaryModes" :key="salaryMode.value"
               class="form-check form-check-inline ms-2">

            <label class="form-check-label">
              <input v-model="state.salaryMode" :value="salaryMode.value" class="form-check-input"
                     type="radio">
              {{ salaryMode.label }}
            </label>
          </div>
          <input v-model="state.totalSalary" v-maska:[maskaOption] class="form-control" type="text"/>
        </div>
        <div class="mb-3">
          <label class="form-label">Số người phụ thuộc </label>
          <input v-model="state.numberOfPeople" class="form-control" type="number">
        </div>
        <div class="mb-3">
          <label class="form-label">
            Bảo hiểm
            <div v-for="insuranceMode in InsuranceModes" :key="insuranceMode.value"
                 class="form-check form-check-inline ms-2">

              <label class="form-check-label">
                <input v-model="state.insuranceMode" :value="insuranceMode.value" class="form-check-input"
                       type="radio">
                {{ insuranceMode.label }}
              </label>
            </div>
          </label>
          <input v-model="state.insuranceInput" v-maska:[maskaOption] class="form-control" type="text"/>
        </div>
        <div class="mb-3">
          <label class="form-label">Thuế đã khấu trừ</label>
          <input v-model="state.payedTax" v-maska:[maskaOption] class="form-control" type="text"/>
        </div>
        <hr>
        <h4>Kết quả quyết toán thuế cả năm</h4>
        <table class="table table-bordered table-striped table-hover">
          <tbody>
          <tr>
            <th>Tổng Thu nhập chịu thuế (1)</th>
            <th class="text-end">{{ formatNumber(totalSalaryOfYear) }}</th>
          </tr>
          <tr>
            <th>Giảm trừ gia cảnh (2)</th>
            <th class="text-end">{{ formatNumber(totalReduceSalary) }}</th>
          </tr>
          <tr>
            <td>Bản thân ({{ formatNumber(taxConfig.selfReduce) }}/tháng)</td>
            <td class="text-end">{{ formatNumber(selfReduceSalary) }}</td>
          </tr>
          <tr>
            <td>Người phụ thuộc ({{ formatNumber(taxConfig.peopleReduce) }}/tháng)</td>
            <td class="text-end">{{ formatNumber(peopleReduceSalary) }}</td>
          </tr>
          <tr>
            <th>Bảo hiểm đã đóng (3)</th>
            <th class="text-end">{{ formatNumber(payedInsurance) }}</th>
          </tr>
          <tr>
            <th>Tổng thu nhập tính thuế (4) = (1) - (2) - (3)</th>
            <th class="text-end">{{ formatNumber(taxSalary) }}</th>
          </tr>
          <tr>
            <th>Tổng thuế phải đóng (5)</th>
            <th class="text-end">{{ formatNumber(totalTax) }}</th>
          </tr>
          <tr>
            <th>Thuế đã khấu trừ (6)</th>
            <th class="text-end">{{ formatNumber(cPayedTax) }}</th>
          </tr>
          <tr>
            <th>
                                <span v-if="remainingTax > 0">
                                    Thuế còn phải đóng (7) = (5) - (6)
                                </span>
              <span v-else>
                                    Thuế được nhận lại (7) = (6) - (5)
                                </span>
            </th>
            <th class="text-end">{{ formatNumber(Math.abs(remainingTax)) }}</th>
          </tr>
          </tbody>
        </table>
        <hr>
      </div>
      <div class="col-lg-5">
        <template v-if="showMonthlyTax">
          <h6>Thuế thu nhập cá nhân hàng tháng</h6>
          <table class="table table-bordered table-striped table-hover">
            <tbody>
            <tr>
              <th>Thu nhập (1)</th>
              <th class="text-end">{{ formatNumber(cTotalSalary) }}</th>
            </tr>
            <tr>
              <th>Giảm trừ gia cảnh (2)</th>
              <th class="text-end">{{ formatNumber(totalReduceSalary / 12) }}</th>
            </tr>
            <tr>
              <th>Bảo hiểm (3)</th>
              <th class="text-end">{{ formatNumber(monthlyInsurance) }}</th>
            </tr>
            <tr>
              <th>Thu nhập tính thuế (4) = (1) - (2) - (3)</th>
              <th class="text-end">
                {{ formatNumber(monthlyTaxSalary) }}
              </th>
            </tr>
            <tr>
              <th>Thuế phải đóng (5)</th>
              <th class="text-end">{{ formatNumber(GetTax(monthlyTaxSalary, 'month')) }}</th>
            </tr>
            <tr>
              <th>Thực nhận (6) = (1) - (3) - (5)</th>
              <th class="text-end">{{ formatNumber(cTotalSalary-GetTax(monthlyTaxSalary, 'month') - monthlyInsurance) }}</th>
            </tr>
            </tbody>
          </table>
        </template>
        <h6>Bảng thuế suất thuế thu nhập cá nhân hiện hành:</h6>
        <table class="table table-bordered table-striped table-hover">
          <thead>
          <tr>
            <th>Bậc thuế</th>
            <th>Phần thu nhập tính thuế/năm (triệu đồng)</th>
            <th>Phần thu nhập tính thuế/tháng (triệu đồng)</th>
            <th>Thuế suất (%)</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(taxRate, index) in taxRateRows" :key="index">
            <td>{{ index + 1 }}</td>
            <td>Trên {{ (taxRate.min / _1M) }} <span v-if="taxRate.max">đến {{ (taxRate.max / _1M) }}</span>
            </td>
            <td>Trên {{ (taxRate.min / 12 / _1M) }} <span v-if="taxRate.max">đến {{
                (taxRate.max / 12 / _1M)
              }}</span></td>
            <td class="text-center">{{ taxRate.rate }} <span v-if="showMonthlyTax && getTaxRateValue(taxRate) > 0"><br>~{{ formatNumber(getTaxRateValue(taxRate)) }}</span></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
