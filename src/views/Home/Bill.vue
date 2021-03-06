<template>
  <div class="bill-page">
    <ValidationObserver ref="userDetails" v-slot="{ invalid, validated, passes, validate }">
      <v-card class="bill-page__card">
        <div class="bill-page__card__header pa-4 d-flex align-center justify-space-between">
          <span class="title">
            Generate Bill
          </span>
          <div class="d-flex align-center">
            <div class="bill-page__card__header pr-2">
              Fiscal year
            </div>
            <div class="bill-page__card__header__input">
              <TextField
                v-model="fiscalYear.startYear"
                :loading="isFormLoading"
                rules="required|integer"
                hide-details
                class="ma-0 pa-0"
              />
            </div>
            <span class="title">-</span>
            <div class="bill-page__card__header__input">
              <TextField
                :value="+fiscalYear.startYear + 1"
                :loading="isFormLoading"
                rules="required|integer"
                class="ma-0 pa-0"
                readonly
                hide-details
              />
            </div>
          </div>
        </div>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col>
              <SelectField
                v-model="currentCustomer"
                item-text="name"
                item-value="id"
                :items="customers"
                :loading="isFormLoading"
                label="Customers"
                :disabled="lockUserDetails"
                :prepend-inner-icon="lockUserDetails ? 'fas fa-lock' : ''"
                return-object
                @input="selectCustomerHandler"
              />
            </v-col>
            <v-col>
              <TextField
                v-model="invoiceNumber"
                class="ma-0 pa-0"
                label="Invoice Number"
                rules="required"
                :error="!invoiceNumberAvailable"
                :loading="isFormLoading"
                :disabled="lockUserDetails"
                :prepend-inner-icon="lockUserDetails ? 'fas fa-lock' : ''"
                @blur="checkIfInvoiceIsAvailable"
              />
            </v-col>

            <v-col>
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="dateInputField"
                    :disabled="lockUserDetails"
                    :loading="isFormLoading"
                    label="Invoice Date"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="dateInputField" @input="dateMenu = false"></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="2">
              <v-btn v-if="lockUserDetails" color="warning" @click="resetForm">Reset</v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <span class="pa-4">
          Main Details
        </span>

        <v-divider />

        <!-- Form for adding particulars -->
        <v-card-text style="position: relative;">
          <ValidationObserver ref="itemDetails" v-slot="{ passes }">
            <v-row>
              <v-col>
                <SelectField
                  v-model="currentProduct"
                  :loading="isFormLoading"
                  item-text="product_name"
                  rules="required"
                  item-value="id"
                  return-object
                  :items="products"
                  label="Products"
                  @input="selectProductHandler"
                />
              </v-col>
              <v-col>
                <TextField
                  v-model="itemSize"
                  :loading="isFormLoading"
                  rules="required"
                  class="ma-0 pa-0"
                  label="Size"
                />
              </v-col>
              <v-col>
                <TextField
                  v-model="itemQuantity"
                  :loading="isFormLoading"
                  rules="required|min_value:1"
                  min="5"
                  class="ma-0 pa-0"
                  label="Quantity"
                />
              </v-col>
              <v-col>
                <TextField
                  v-model="itemRate"
                  :loading="isFormLoading"
                  :rules="{ required: true, regex: /^\d*\.?\d*$/, min_value: 1 }"
                  class="ma-0 pa-0"
                  label="Rate"
                />
                <!-- <TextField v-model="itemRate" rules="required|min_value:1" class="ma-0 pa-0" label="Rate" /> -->
              </v-col>
              <v-col class="text-center">
                Amount:
                <div class="title">&#8377; {{ roundNumber(itemAmount) }}</div>
              </v-col>
              <v-divider vertical />
              <v-col cols="1">
                <v-btn :disabled="!currentCustomer" type="submit" color="info" @click="passes(addItemsToTable)">
                  <v-icon left small>fas fa-plus</v-icon>
                  <span>Add</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <TextField
                  v-model="discountRate"
                  :loading="isFormLoading"
                  :rules="{ regex: /^\d*\.?\d*$/, min_value: 0, max_value: 100 }"
                  class="ma-0 pa-0"
                  label="Discount Rate (%)"
                />
              </v-col>
              <v-col class="text-center">
                Amount:
                <div class="title">&#8377; {{ roundNumber(itemDiscountAmount) }}</div>
              </v-col>
              <v-col class="text-center">
                Total:
                <div class="title">&#8377; {{ roundNumber(itemAfterDiscountAmount) }}</div>
              </v-col>
              <v-divider vertical />
              <v-col class="text-center">
                CGST ({{ cgstRate }}%) :
                <div class="title">&#8377; {{ roundNumber(itemCgstAmount) }}</div>
              </v-col>
              <v-col class="text-center">
                SGST ({{ sgstRate }}%) :
                <div class="title">&#8377; {{ roundNumber(itemSgstAmount) }}</div>
              </v-col>
              <v-col class="text-center">
                IGST ({{ igstRate }}%) :
                <div class="title">&#8377; {{ roundNumber(itemIgstAmount) }}</div>
              </v-col>
              <v-col class="text-center">
                Total Tax Amount :
                <div class="title">&#8377; {{ roundNumber(itemTaxAmount) }}</div>
              </v-col>
              <v-divider vertical />
              <v-col class="text-center">
                Total :
                <div class="title">&#8377; {{ roundNumber(itemTotalPayableAmount) }}</div>
              </v-col>
            </v-row>
          </ValidationObserver>
        </v-card-text>
        <v-divider />

        <!-- Normal Table -->
        <v-card-text>
          <v-data-table
            :headers="tableHeaders"
            :items="tableDetails"
            :loading="isFormLoading"
            class="elevation-1"
            hide-default-footer
          >
            <template v-slot:header="{ props }">
              <thead class="v-data-table-header">
                <tr>
                  <th class="v-data-table__divider"></th>
                  <th colspan="5" class="text-center v-data-table__divider">
                    Particulars
                  </th>
                  <th colspan="3" class="text-center v-data-table__divider">
                    Discount
                  </th>
                  <th></th>
                </tr>
              </thead>
            </template>
            <template v-slot:item.serialNumber="{ item }">
              {{ tableDetails.map(x => x.uniqId).indexOf(item.uniqId) + 1 }}
            </template>
            <template v-slot:item.remove="{ item }">
              <v-btn icon @click="removeItem(item)">
                <v-icon color="error">
                  far fa-times-circle
                </v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <!-- Summary Table -->
          <div class="d-flex align-center justify-end">
            <v-simple-table style="width: 25vw" class="mt-4">
              <template v-slot:default>
                <tbody>
                  <tr>
                    <td>Total Taxable Amount</td>
                    <td class="font-weight-bold title">&#8377; {{ aggregatedTotalTaxableAmountAmount }}</td>
                  </tr>
                  <tr>
                    <td>CGST</td>
                    <td class="font-weight-bold title">&#8377; {{ aggregatedCgstAmount }}</td>
                  </tr>
                  <tr>
                    <td>SGST</td>
                    <td class="font-weight-bold title">&#8377; {{ aggregatedSgstAmount }}</td>
                  </tr>
                  <tr>
                    <td>IGST</td>
                    <td class="font-weight-bold title">&#8377; {{ aggregatedIgstAmount }}</td>
                  </tr>
                  <tr>
                    <td>Total Invoice Amount</td>
                    <td class="font-weight-bold title">&#8377; {{ aggregatedTotalInvoiceAmount }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn color="primary" @click="submitBill">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </ValidationObserver>
    <BillModal
      v-if="showPreviewBill"
      :data="invoicePostData"
      :title="'Title'"
      :loading="false"
      @bill-modal="billModalActionHandler"
    />
  </div>
</template>
<script>
import { ValidationObserver } from "vee-validate";
import TextField from "@/components/TextField";
import SelectField from "@/components/SelectField";
import BillModal from "@/components/BillModal";
import * as AT from "@/store/actionTypes";
import Utils from "@/utils/Utils";

export default {
  name: "Bill",
  components: {
    ValidationObserver,
    TextField,
    SelectField,
    BillModal
  },
  data() {
    return {
      fiscalYear: {
        startYear: "",
        endYear: ""
      },
      // top 3 textboxes
      currentCustomer: null,
      invoiceNumber: null,
      dateMenu: false,
      date: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      dateInputField: "",

      // main details
      currentProduct: null,
      itemSize: "",
      itemQuantity: null,
      itemRate: null,
      discountRate: null,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,

      tableDetails: [],

      invoiceNumberAvailable: true,
      isFormLoading: false,

      showPreviewBill: false,
      invoicePostData: {}
    };
  },
  computed: {
    // item
    itemAmount() {
      return +this.itemRate * +this.itemQuantity;
    },
    itemDiscountAmount() {
      return this.itemAmount * (this.discountRate / 100);
    },
    // IMP: itemAfterDiscountAmount are basically taxable amount
    itemAfterDiscountAmount() {
      return this.itemAmount - this.itemDiscountAmount;
    },
    itemCgstAmount() {
      return (this.cgstRate / 100) * this.itemAfterDiscountAmount;
    },
    itemSgstAmount() {
      return (this.sgstRate / 100) * this.itemAfterDiscountAmount;
    },
    itemIgstAmount() {
      return (this.igstRate / 100) * this.itemAfterDiscountAmount;
    },
    itemTaxAmount() {
      return this.itemCgstAmount + this.itemSgstAmount + this.itemIgstAmount;
    },
    itemTotalPayableAmount() {
      return this.itemTaxAmount + this.itemAfterDiscountAmount;
    },

    // aggregatedTotalTaxableAmountAmount (after adding discount, before deducting taxes)
    aggregatedTotalTaxableAmountAmount() {
      return this.tableDetails.reduce((acc, current) => (acc += current.itemAfterDiscountAmount), 0);
    },
    aggregatedCgstAmount() {
      return this.tableDetails.reduce((acc, current) => (acc += current.itemCgstAmount), 0);
    },
    aggregatedSgstAmount() {
      return this.tableDetails.reduce((acc, current) => (acc += current.itemSgstAmount), 0);
    },
    aggregatedIgstAmount() {
      return this.tableDetails.reduce((acc, current) => (acc += current.itemIgstAmount), 0);
    },
    aggregatedTotalInvoiceAmount() {
      return (
        this.aggregatedTotalTaxableAmountAmount +
        this.aggregatedCgstAmount +
        this.aggregatedSgstAmount +
        this.aggregatedIgstAmount
      );
    },

    // extras
    userDetails() {
      return this.$store.getters.userDetails && this.$store.getters.userDetails.user_detail;
    },
    customers() {
      return this.$store.getters.customers || [];
    },
    products() {
      return this.$store.getters.products;
    },
    tableHeaders() {
      return [
        { text: "SR", value: "serialNumber", divider: true },
        { text: "Name", value: "productName", width: "10rem" },
        { text: "Size", value: "size" },
        { text: "Qty", value: "quantity" },
        { text: "Rate", value: "price" },
        { text: "Amount", value: "totalAmount", divider: true },
        { text: "Rate", value: "discount_percentage" },
        { text: "Amount", value: "discount_amount" },
        { text: "Total", value: "itemAfterDiscountAmount", divider: true },
        { text: "Action", value: "remove" }
      ];
    },
    lockUserDetails() {
      return !this.tableDetails.length ? false : true;
    }
  },
  created() {
    this.dateInputField = `${this.year}-${this.month}-${this.date}`;
    this.fiscalYear.startYear = this.year;
    this.getInvoiceNumber();
  },
  methods: {
    getInvoiceNumber() {
      this.isFormLoading = true;
      this.$store
        .dispatch(AT.INVOICE_NUMBER)
        .then(res => (this.invoiceNumber = res.invoiceNumber))
        .finally(() => (this.isFormLoading = false));
    },
    checkIfInvoiceIsAvailable() {
      this.isFormLoading = true;
      const startyear = +this.fiscalYear.startYear;
      const endYear = (+this.fiscalYear.startYear + 1).toString().slice(-2);
      this.$store
        .dispatch(AT.CHECK_INVOICE, { invoiceNo: this.invoiceNumber, fiscalYear: `${startyear}-${endYear}` })
        .then(res => {
          if (res.message == "proceed") {
            this.invoiceNumberAvailable = true;
            this.$store.dispatch(AT.SNACKBAR, {
              text: "Invoice Number Available"
            });
          } else {
            this.invoiceNumberAvailable = false;
            this.$store.dispatch(AT.SNACKBAR, {
              color: "error",
              text: "Invoice Number not available"
            });
          }
        })
        .catch(err => {
          this.invoiceNumberAvailable = false;
          this.$store.dispatch(AT.SNACKBAR, {
            color: "error",
            text: "Some unexpected error occured. Please try again after few minutes"
          });
        })
        .finally(() => (this.isFormLoading = false));
    },
    roundNumber(value) {
      return Utils.roundNumber(value);
    },
    addItemsToTable() {
      this.tableDetails.push({
        uniqId: Date.now(),
        product_id: this.currentProduct.id,
        productName: this.currentProduct.product_name,
        size: this.itemSize,
        quantity: this.itemQuantity,
        price: this.itemRate,
        totalAmount: this.itemAmount,
        discount_percentage: this.discountRate ? this.discountRate : 0,
        discount_amount: this.itemDiscountAmount,
        // IMP: itemAfterDiscountAmount are basically taxable amount
        itemAfterDiscountAmount: this.itemAfterDiscountAmount,
        itemCgstAmount: this.itemCgstAmount ? this.itemCgstAmount : 0,
        itemSgstAmount: this.itemSgstAmount ? this.itemSgstAmount : 0,
        itemIgstAmount: this.itemIgstAmount ? this.itemIgstAmount : 0
      });
      this.resetItemForm();
    },
    removeItem(item) {
      const index = this.tableDetails.findIndex(td => {
        return td.uniqId === item.uniqId;
      });
      this.tableDetails.splice(index, 1);
    },
    submitBill() {
      this.isFormLoading = true;
      const startyear = +this.fiscalYear.startYear;
      const endYear = (+this.fiscalYear.startYear + 1).toString().slice(-2);
      const fiscalYear = `${startyear}-${endYear}`;

      const postData = {
        user_id: this.userDetails && this.userDetails.id,
        firm_id: this.currentCustomer && this.currentCustomer.id,
        invoice_no: this.invoiceNumber,
        invoiceYear: fiscalYear,
        taxable_amount: this.aggregatedTotalTaxableAmountAmount,
        sgst_percentage: this.sgstRate,
        sgst_amount: this.aggregatedSgstAmount,
        cgst_percentage: this.cgstRate,
        cgst_amount: this.aggregatedCgstAmount,
        igst_percentage: this.igstRate,
        igst_amount: this.aggregatedIgstAmount,
        total_payable_amount: this.aggregatedTotalInvoiceAmount,
        bill_detail: this.tableDetails
      };

      if (this.tableDetails && this.tableDetails.length) {
        this.$store
          .dispatch(AT.SUBMIT_BILL, postData)
          .then(res => {
            this.invoicePostData = res;
            this.$store.dispatch(AT.SNACKBAR, {
              text: "Bill creation successful"
            });
            this.resetForm();
            // show bill
            this.showPreviewBill = true;
          })
          .catch(err => {
            this.$store.dispatch(AT.SNACKBAR, {
              color: "error",
              text: "Something went wrong, please try again after sometime"
            });
          })
          .finally(() => (this.isFormLoading = false));
      } else {
        this.$store.dispatch(AT.SNACKBAR, {
          color: "error",
          text: "Please fill in the data first"
        });
      }
    },
    selectCustomerHandler(e) {
      if (e.shipping_state_code == this.userDetails.state_code) {
        this.cgstRate = 2.5;
        this.sgstRate = 2.5;
        this.igstRate = 0;
      } else {
        this.cgstRate = 0;
        this.sgstRate = 0;
        this.igstRate = 5;
      }
    },
    selectProductHandler(e) {
      e ? (this.itemRate = e.product_price) : "";
    },
    resetForm() {
      this.tableDetails = [];
      this.$refs.userDetails.reset();
      this.resetItemForm();
    },
    async resetItemForm() {
      this.currentProduct = null;
      this.itemSize = "";
      this.itemQuantity = null;
      this.itemRate = null;
      requestAnimationFrame(() => {
        this.$refs.itemDetails.reset();
      });
    },
    billModalActionHandler(data) {
      if (!data) {
        // close modal
        this.showPreviewBill = false;
      }
    }
  }
};
</script>
<style lang="scss">
.bill-page {
  &__card {
    &__header {
      &__input {
        width: 3rem;
        .v-input {
          padding: 0;
          margin: 0;
        }
      }
    }
  }
}
</style>
