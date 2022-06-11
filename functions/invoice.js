const fs = require("fs");
const path = require("path")
const PDFDocument = require("pdfkit"); 

async function createInvoice(invoice, path) {
  
  console.log("Generate Invoice",invoice);
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc,invoice);

  doc.end();
  doc.pipe(fs.createWriteStream(`${path}`));
}

function generateHeader(doc) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Jerry Interprise", 110, 57)
    .fontSize(10)
    .text("Jerry Interprise", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("Navsari, Gujarat, 396421", 200, 80, { align: "right" })
    .text("Email Address : jerry@crm.com", 200, 95, { align: "right" })
    .text("Phone Number : XXXXXXXXXX", 200, 110, { align: "right" })
    .text("GSTIN NO. : XYXYXYXYXYXY",200,125,{ align : "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("Helvetica")
    .text("Method:", 50, customerInformationTop + 15)
    .font("Helvetica-Bold")
    .text(invoice.method, 150, customerInformationTop + 15)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 30)
    .text(formatDate(new Date()), 150, customerInformationTop + 30)
    .text("Balance Due:", 50, customerInformationTop + 45)
    .text(
      invoice.balance_due,
      150,
      customerInformationTop + 45
    )

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.state +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 270);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  var x= 0;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Product",
    "Category",
    "Unit Cost",
    "Quantity",
    "Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.category,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 20);
  }

  const taxPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    taxPosition,
    "",
    "",
    "Tax + Charges",
    "",
    formatCurrency(invoice.tax)
  );

  const subtotalPosition = taxPosition + 20;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal)
  );

 if(invoice.paid_amount != 0){
  const alreadyPaidPosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    alreadyPaidPosition,
    "",
    "",
    "Already Paid",
    "",
    formatCurrency(invoice.paid_amount)
  );
  x = 5;
 }

  const paidToDatePosition = subtotalPosition + 20 + x;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    "",
    formatCurrency(invoice.paid)
  );

  const duePosition = paidToDatePosition + 25 + x;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Balance Due",
    "",
    invoice.balance_due
  );
  doc.font("Helvetica");
}

function generateFooter(doc,invoice) {
  doc
    .fontSize(10)
    .text(
      `Signature : ${invoice.deposit_by_user}`,
      50,
      780,
      { align: "right", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 250, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return  cents
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = createInvoice;