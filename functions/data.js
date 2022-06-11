const createInvoice = require("../functions/invoice");
const Product = require("../models/product");

async function createInvoiceData(orderData){

  console.log(orderData.job.transactions.length);
  let itemDetail = {
        item: "",
        category : "",
        quantity: 0,
        amount: 0
  }
  let tax;
  let items = [];
  let orderBill = orderData.job.total_price;
  let last_paid_amount = 0;
  let paid_amount = 0;
  let balance_due = 0;

  for (let i = 0; i < orderData.job.selectedproduct.length; i++) {
    const element = orderData.job.selectedproduct[i];
    let itemDetail = {
      item: "",
      category : "",
      quantity: 0,
      amount: 0
    }
    let product = await Product.findById(element._id).populate("category")
    itemDetail.item = product.product_name;
    itemDetail.category = product.category.categorgy_name;
    itemDetail.quantity = element.quantity;
    itemDetail.amount = product.price * element.quantity;
    items.push(itemDetail);
  }

  for (let i = 0; i < (orderData.job.transactions.length); i++) {
    const element = orderData.job.transactions[i];
    console.log("Transaction",i," ",element);
  }

  if(orderData.job.transactions.length > 1){
    for (let i = 0; i < (orderData.job.transactions.length - 2); i++) {
      const element = orderData.job.transactions[i];
      paid_amount = paid_amount + element.transaction_info.amount;
    }
    balance_due = orderBill - paid_amount - orderData.job.transactions[orderData.job.transactions.length - 1].transaction_info.amount
    last_paid_amount = orderData.job.transaction[orderData.job.transactions.length - 1].transaction_info.amount
  }else{
    console.log(orderData.job.transactions[0]);
    console.log(orderData.job.transactions[orderData.job.transactions.length - 1]);
    balance_due = orderBill - paid_amount - orderData.job.transactions[orderData.job.transactions.length - 1].transaction_info.amount;
    console.log(balance_due);
    last_paid_amount = orderData.job.transactions[orderData.job.transactions.length - 1].transaction_info.amount 
  }

  
  tax = orderData.job.tax_price;

  let invoice = {
    shipping: {
      name: `${orderData.client.organization_name}`,
      address: `${orderData.client.street}`,
      city: `${orderData.client.city}`,
      state: `${orderData.client.state}`,
      country: `India`,
      postal_code: `${orderData.client.zip}`
    },
    items: items,
    subtotal: orderBill,
    tax : tax,
    paid_amount : paid_amount,
    paid : last_paid_amount,
    balance_due : balance_due,
    invoice_nr: orderData.transaction_info.receipt_number,
    deposit_by_user : `${orderData.deposited_by_user.first_name} ${orderData.deposited_by_user.last_name}`,
    method : orderData.transaction_info.method,
  };

  console.log("Items",invoice.items);
  createInvoice(invoice,`public/Invoice/${orderData.transaction_info.receipt_number}.pdf`);
}

module.exports = createInvoiceData;