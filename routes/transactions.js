const multer = require('multer');
const path = require('path');
let fs = require('fs');
let dir = './public/exportReceipt/';
const express    = require("express"),
router			 = express.Router();
moment		     = require("moment");

// Schemas
const Transaction = require ("../models/transaction");
User 			  = require ("../models/user");
Ticket 	  		  = require ("../models/ticket");
Job 	   		  = require ("../models/job");
Client 			  = require ("../models/client");

// Functions
let numberWithCommas = require("../functions/numberWithCommas");
let isLoggedIn = require("../functions/isLoggedIn");
let isAdministrator = require("../functions/isAdministrator");
let isManager = require("../functions/isManager");
let ObjectId = require("mongoose").Types.ObjectId;
let invoiceData = require("../functions/data");

let upload = multer({
	storage: multer.diskStorage({
  
	  destination: (req, file, callback) => {
		  console.log("File")
		if (!fs.existsSync(dir)) {
		  fs.mkdirSync(dir);
		}
		callback(null, './public/exportReceipt/');
	  },
	  filename: (req, file, callback) => { callback(null, file.fieldname + '-' + req.body.transaction.transaction_info.receipt_number + path.extname(file.originalname)); }
  
	}),
  
	fileFilter: (req, file, callback) => {
	  let ext = path.extname(file.originalname)
	  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext != '.pdf') {
		  console.log("File");
		return callback(/*res.end('Only images are allowed')*/ null, false)
	  }
	  callback(null, true)
	}
  });

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


// ========================================================================== index
router.get("/", isLoggedIn, async function(req, res){
	let transactions = [];
	try {
		transactions = await Transaction.find({}).populate("job").populate("client").populate("deposited_by_user").exec();
		for (let i = 0; i < transactions.length; i++){
			transactions[i]["transaction_info"]["new_amount"] = numberWithCommas(transactions[i]["transaction_info"]["amount"]);
		}
	}
	catch (err) {console.log(err);}	
	res.render("transactions/transactions", {transactions: transactions,title : "transactions"});
});

// ========================================================================== new
router.get("/addImport", isLoggedIn, async function(req, res){
	let users = [];
	let clients = [];
	let jobs = [];
	try {
		users = await User.find({});
		clients = await Client.find({'client_type' : 'Vendor'});
		jobs = await Job.find({'job_type' : 'Import'});
	}
	catch (err) {console.log(err);}	
	res.render("transactions/add_transaction", {users: users, clients: clients, jobs: jobs,job_type:"Import",title : "transactions"});	
});

router.get("/addExport", isLoggedIn, async function(req, res){
	let users = [];
	let clients = [];
	let jobs = [];
	try {
		users = await User.find({});
		clients = await Client.find({'client_type' : 'Client'});
		jobs = await Job.find({'job_type' : 'Export'});
	}
	catch (err) {console.log(err);}	
	res.render("transactions/add_transaction", {users: users, clients: clients, jobs: jobs,job_type:"Export",title : "transactions"});	
});

// ========================================================================== show
router.get("/:id", isLoggedIn, async function(req, res){
	let transaction = {};
	let price;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions");
		}
		transaction = await Transaction.findById(req.params.id);
		if(!transaction){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions")
		}
		transaction = await Transaction.findById(req.params.id).populate("job").populate("client").populate("deposited_by_user").exec();
		price = await numberWithCommas(transaction["transaction_info"]["amount"]);
		console.log(transaction);
	}
	catch (err) {console.log(err);}	
	res.render("transactions/transaction", {transaction: transaction, price: price,title : "transactions"});
});

// ========================================================================== edit
router.get("/:id/edit", isLoggedIn, isManager, async function(req, res){
	let transaction = {};
	let users = [];
	let clients = [];
	let jobs = [];
	let deposit_date;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions");
		}
		transaction = await Transaction.findById(req.params.id);
		if(!transaction){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions")
		}
		transaction = await Transaction.findById(req.params.id).populate("job").populate("client").populate("deposited_by_user").exec();
		users = await User.find({});
		clients = await Client.find({});
		jobs = await Job.find({});
		deposit_date = moment(transaction["transaction_info"]["date"]).format("YYYY-MM-DD");
	}
	catch (err) {console.log(err);}	
	res.render("transactions/edit_transaction", {transaction: transaction, users: users, clients: clients, jobs: jobs, deposit_date: deposit_date,title : "transactions"});
});

// ========================================================================== create
router.post("/", isLoggedIn,upload.any() ,async function(req, res){ 
	try {
		let transaction = req.body.transaction;
		let jobType = transaction.job_type
		if(jobType === "Import"){
			transaction.transactionLink = req.files[0].path;
		}
		transaction["transaction_info"].date = moment(transaction["transaction_info"].date);
		transaction.date_added = moment(moment(Date.now()).format("YYYY-MM-DD"));
		if(transaction.transaction_info.amount){
			let remaining_amountForJob = 0;
			var findJob = await Job.findById(req.body.transaction["job"]);
			if(findJob.remaining_amount === 0){
				req.flash("error","Payement has been Completed for that order")
				return res.redirect("/transactions");
			}else if(findJob.remaining_amount === undefined){
				remaining_amountForJob = parseFloat(parseFloat(findJob.total_price) - parseFloat(transaction.transaction_info.amount));
			}else{
				remaining_amountForJob = parseFloat(parseFloat(findJob.remaining_amount) - parseFloat(transaction.transaction_info.amount));
			}
			await Job.findByIdAndUpdate(req.body.transaction["job"],{
				'remaining_amount' : remaining_amountForJob
			})
		}
		let newTransaction = await Transaction.create(transaction);
		console.log("Transaction successfully created", newTransaction);

		// attach transaction to connected job
		let job = await Job.findById(req.body.transaction["job"]);
		await job.transactions.push(newTransaction._id);
		await job.save();
		console.log('transaction id added to job documents successfully');

		// attach transaction to conencted client
		let client = await Client.findById(req.body.transaction["client"]);
		await client.transactions.push(newTransaction._id);
		await client.save();
		console.log('transaction id added to client documents successfully');
		transaction = await Transaction.findById(newTransaction._id).populate("job client deposited_by_user").populate({
			path : 'job',
			populate : {
				path : 'transactions',
				model : 'Transaction'
			}
		});
		if(jobType === "Export"){
			console.log("Export")
			invoiceData(transaction);
			await Transaction.findByIdAndUpdate(newTransaction._id,{
				'transactionLink' : `public/Invoice/${transaction.transaction_info.receipt_number}.pdf`
			})
		}
		console.log(transaction);
	}
	catch (err) {console.log(err);}	
	req.flash("success", "New transaction has been created");	
	res.redirect("/transactions");
});


router.get("/receipt/:id",isLoggedIn,async (req,res)=>{
	let transaction;
	let data;
	let fileExtension;
	try{
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions");
		}
		transaction = await Transaction.findById(req.params.id);
		if(!transaction){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions")
		}
		transaction = await Transaction.findById(req.params.id).populate("job client deposited_by_user");
		console.log(transaction);
		data = transaction.transactionLink;
		console.log(data);
		fileExtension = data.split(".")[1];
		data = data.slice(6);
	}catch(err){
		console.log(err);
	}
	res.render("transactions/receiptShow",{
		data : data,
		title:"transactions",
		transaction : transaction,
		fileType : fileExtension
	})
});


// ========================================================================== update
router.put("/:id", isLoggedIn, isManager, async function(req, res){ 
	let transactionToUpdate;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions");
		}
		transactionToUpdate = await Transaction.findById(req.params.id);
		if(!transactionToUpdate){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions")
		}
		// remove transaction from old connected client
		await Client.updateMany({transactions: req.params.id},
				{$pull: {transactions: {$in: [req.params.id]}} 
			});
		console.log("transaction id removed from old client documents successfully");

		// remove transaction from old conencted job
		await Job.updateMany({transactions: req.params.id},
				{$pull: {transactions: {$in: [req.params.id]}} 
			});
		console.log("transaction id removed from old job documents successfully");	

		let transaction = req.body.transaction;
		if(transaction.job_type === "Import"){
			transaction.transactionLink = req.file.path;
		}
		transaction["transaction_info"].date = moment(transaction["transaction_info"].date);
		let updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, transaction);
		console.log("Transaction successfully updated");

		// attach transaction to new connected job
		let job = await Job.findById(req.body.transaction["job"]);
		await job.transactions.push(updatedTransaction._id);
		await job.save();
		console.log('transaction id added to new job documents successfully');

		// attach transaction to new conencted client
		let client = await Client.findById(req.body.transaction["client"]);
		await client.transactions.push(updatedTransaction._id);
		await client.save();
		console.log('transaction id added to client documents successfully');

		transaction = await Transaction.findById(newTransaction._id).populate("job client deposited_by_user");
		console.log(transaction);
		if(transaction.job_type === "Export"){
			const path = invoiceData(transaction);
		}
	}
	catch (err) {console.log(err);}	
	req.flash("info", "Transaction has been updated");
	res.redirect("/transactions/" + req.params.id);
});

// ========================================================================== delete
router.delete("/:id", isLoggedIn, isAdministrator, async function(req, res){ 
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions");
		}
		transaction = await Transaction.findById(req.params.id);
		if(!transaction){
			req.flash("error","Transaction Does not Exits");
			return res.redirect("/transactions")
		}
		// remove transaction from connected client
		await Client.updateMany({transactions: req.params.id},
				{$pull: {transactions: {$in: [req.params.id]}} 
			});
		console.log("transaction id removed from client documents successfully");

		// remove transaction from conencted job
		await Job.updateMany({transactions: req.params.id},
				{$pull: {transactions: {$in: [req.params.id]}} 
			});
		console.log("transaction id removed from job documents successfully");

		// 	delete job
		await Transaction.findByIdAndRemove(req.params.id);
		console.log("transaction has been deleted");
	}
	catch (err) {console.log(err);}	
	req.flash("error", "Transaction has been deleted");
	res.redirect("/transactions");
});
	
module.exports = router;