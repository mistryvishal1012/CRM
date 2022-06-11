const express    = require("express"),
router			 = express.Router(),
moment		     = require("moment");
const fs = require('fs');
const path = require('path');


// Schemas
const User		  = require ("../models/user");
Ticket 	  		  = require ("../models/ticket");
Job 	   		  = require ("../models/job");
Client 			  = require ("../models/client");
Products          = require("../models/product");
Transaction       = require("../models/transaction");

// Functions
let numberWithCommas = require("../functions/numberWithCommas");
let isLoggedIn = require("../functions/isLoggedIn");
let isAdministrator = require("../functions/isAdministrator");
let isManager = require("../functions/isManager");
let ObjectId = require("mongoose").Types.ObjectId;

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

// ========================================================================== index
router.get("/", isLoggedIn, async function(req, res){
	let jobs = [];
	try {
		jobs = await Job.find({}).populate("created_by").populate("client").populate("transactions").exec();
	}
	catch (err) {console.log(err);}	
	res.render("jobs/jobs", {jobs: jobs, title:"jobs"});
});

// ========================================================================== new
router.get("/addImportJob", isLoggedIn, async function(req, res){
	let users = [];
	let clients = [];
	let products;
	try {
		users = await User.find({})
		clients = await Client.find({$and: [
			{ 'client_type' : "Vendor" },
			{'active' : true}
		 ]})
		products = await Products.find({'isActive' : true}).populate("category");
	}
	catch (err) {console.log(err);}	
	res.render("jobs/add_importjob", {users: users, clients: clients, products : products, title:"jobs"});
});

router.get("/addExportJob", isLoggedIn, async function(req, res){
	let users = [];
	let clients = [];
	let products;
	try {
		users = await User.find({})
		clients = await Client.find({$and: [
			{'clientKYC' : true },
			{ 'client_type' : "Client" },
			{'active' : true}
		 ]})
		products = await Products.find({'isActive' : true}).populate("category");
	}
	catch (err) {console.log(err);}	
	res.render("jobs/add_exportjob", {users: users, clients: clients, products : products, title:"jobs"});
});

// ========================================================================== show
router.get("/:id", isLoggedIn, async function(req, res){
	let job = {};
	let price;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs");
		}
		job = await Job.findById(req.params.id);
		if(!job){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs")
		}
		job = await Job.findById(req.params.id).populate("created_by").populate("client").populate("transactions").populate("selectedproduct._id").exec();
		console.log(job.selectedproduct)
		let balance = job.total_price;
		// Add Price with commas
		if (job.transactions){
			for (let i = 0; i < job["transactions"].length; i++){
				job["transactions"][i]["transaction_info"]["new_amount"] = numberWithCommas(job["transactions"][i]["transaction_info"]["amount"]);
			}	
			// Balance				
			for (let i = 0; i < job["transactions"].length; i++){
				balance = balance - job["transactions"][i]["transaction_info"]["amount"];
			}
		}

		job.balance = await numberWithCommas(balance);
		price = await numberWithCommas(job.total_price);
	}
	catch (err) {console.log(err);}	
	res.render("jobs/job", {job: job, price: price, title:"jobs"});
});

// ========================================================================== edit
router.get("/import/:id/edit", isLoggedIn, isManager, async function(req, res){
	let job = {};
	let users = [];
	let clients = [];
	let start_date;
	let end_date;
	let products;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs");
		}
		job = await Job.findById(req.params.id);
		console.log(job.selectedproduct)
		if(!job){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs")
		}
		job = await Job.findById(req.params.id).populate("created_by").populate("client").populate("transactions").populate("selectedproduct._id").populate({
			path : "selectedproduct._id",
			populate : {
				path : "category",
				model : "Category"
			}
		}).exec();
		console.log(job.selectedproduct);
		users = await User.find({});
		clients = await Client.find({$and: [
			{ 'client_type' : "Vendor" },
			{'active' : true}
		 ]});
		products = await Products.find({'isActive' : true}).populate("category");
		console.log(products);
		start_date = moment(job.start_date).format("YYYY-MM-DD");
		end_date = moment(job.end_date).format("YYYY-MM-DD");
	}
	catch (err) {console.log(err);}	
	res.render("jobs/edit_importjob", {job: job, users: users, clients: clients, start_date, end_date, products : products,title:"jobs"});
});

router.get("/export/:id/edit", isLoggedIn, isManager, async function(req, res){
	let job = {};
	let users = [];
	let clients = [];
	let start_date;
	let end_date;
	let products;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs");
		}
		job = await Job.findById(req.params.id);
		console.log(job.selectedproduct)
		if(!job){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs")
		}
		job = await Job.findById(req.params.id).populate("created_by").populate("client").populate("transactions").populate("selectedproduct._id").populate({
			path : "selectedproduct._id",
			populate : {
				path : "category",
				model : "Category"
			}
		}).exec();
		console.log(job.selectedproduct);
		users = await User.find({});
		clients = await Client.find({$and: [
			{'clientKYC' : true },
			{ 'client_type' : "Client" },
			{'active' : true}
		 ]});
		products = await Products.find({'isActive' : true}).populate("category");
		console.log(products);
		start_date = moment(job.start_date).format("YYYY-MM-DD");
		end_date = moment(job.end_date).format("YYYY-MM-DD");
	}
	catch (err) {console.log(err);}	
	res.render("jobs/edit_exportjob", {job: job, users: users, clients: clients, start_date, end_date, products : products,title:"jobs"});
});


// ========================================================================== create
router.post("/", isLoggedIn, async function(req, res){ 
	console.log(req.body.job)
	let job = req.body.job;
	
	try {		
		job.start_date = moment(job.start_date);
		job.end_date = moment(job.end_date);		
		job.date_created = moment(moment(Date.now()).format("YYYY-MM-DD"));
		job.created_by = req.user.id;
		job.total_price = parseFloat(job.billing_price) + parseFloat(job.tax_price);
		let jobCreated = await Job.create(job);
		console.log("Job " + "'" + job.job_name + "'" + " has been created");

		// attach job to connected client
		let client = await Client.findById(req.body.job["client"]);
		await client.jobs.push(jobCreated._id);
		await client.save();
		console.log('Job id added to client documents successfully');

		switch (job.job_type) {
			case "Export":
				job.selectedproduct.forEach(async product => {
					await Products.findByIdAndUpdate(product._id,{
						$inc : {
							'inventory_quantity' : -product.quantity
						}
					})
				});
				break;
			case "Import" :
				job.selectedproduct.forEach(async product => {
					await Products.findByIdAndUpdate(product._id,{
						$inc : {
							'total_quantity' : product.quantity,
							'inventory_quantity' : product.quantity
						}
					})
				});
				break;
		}
	}
	catch (err) {console.log(err);}	
	req.flash("success", "New job has been created");
	res.redirect("/jobs");
});

// ========================================================================== update
router.put("/:id", isLoggedIn, isManager, async function(req, res){ 
	let jobToUpdate;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs");
		}
		jobToUpdate = await Job.findById(req.params.id);
		if(!jobToUpdate){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs")
		}
		let job = req.body.job;

		switch (job.job_type) {
			case "Export":
				job.selectedproduct.forEach(async product => {
					var productInInventory = await Products.findById(product._id);
					var total_quantity;
					var inventory_quantity;
					console.log("Export")
					console.log("Product",product);
					total_quantity = parseInt(product.oldTotalQuantity)
					inventory_quantity = parseInt(product.oldInventoryQuantity) + (parseInt(product.oldQuantity) - parseInt(product.quantity));
					console.log(total_quantity,inventory_quantity)
					await Products.findByIdAndUpdate(product._id,{
						$set : {
							'total_quantity' : total_quantity,
							'inventory_quantity' : inventory_quantity
						}
					})
				});
				break;
			case "Import" :
				console.log(job)
				job.selectedproduct.forEach(async product => {
					var productInInventory = await Products.findById(product._id);
					var total_quantity;
					var inventory_quantity;
					console.log("Import")
					console.log("Product",product)																																														
					total_quantity = parseInt(product.oldTotalQuantity) - parseInt(product.oldQuantity) + parseInt(product.quantity);
					inventory_quantity = parseInt(product.oldInventoryQuantity) - parseInt(product.oldQuantity) + parseInt(product.quantity);
					console.log(total_quantity,inventory_quantity)
					await Products.findByIdAndUpdate(product._id,{
						$set : {
							'total_quantity' : total_quantity,
							'inventory_quantity' : inventory_quantity
						}
					})
				});
				break;
		}
		// remove job from old conencted client
		await Client.updateMany({jobs: req.params.id},
			{$pull: {jobs: {$in: [req.params.id]}} 
			});
		console.log('Job id removed from old client documents successfully');	
		
		
		job.start_date = moment(job.start_date);
		job.end_date = moment(job.end_date);		
		let foundJob = await Job.findByIdAndUpdate(req.params.id, job);
		console.log("Job " + "'" + job.job_name + "'" + " has been updated");			

		// attach job to new connected client
		let client = await Client.findById(req.body.job["client"]);		
		client.jobs.push(foundJob._id);
		client.save();
		console.log('Job id added to new client documents successfully');
	}
	catch (err) {console.log(err);}	
	req.flash("info", "Job has been updated");
	res.redirect("/jobs/" + req.params.id);
});

// ========================================================================== delete
router.delete("/:id", isLoggedIn, isAdministrator, async function(req, res){
	let job = {};	
	let transactions;	
	const exportOrderFile = "../public/Invoice"
	const importOrderFile = "../public/exportReceipt"														
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs");
		}
		job = await Job.findById(req.params.id);
		if(!job){
			req.flash("error","Job Does not Exits");
			return res.redirect("/jobs")
		}
		console.log('Job id removed from client documents successfully');
		transactions = job.transactions;
		switch (job.job_type) {
			case "Export":
				job.selectedproduct.forEach(async product => {
					var productInInventory = await Products.findById(product._id);
					var inventory_quantity = productInInventory.inventory_quantity;
					inventory_quantity = inventory_quantity + product.quantity;
					await Products.findByIdAndUpdate(product._id,{
						$set : {
							'inventory_quantity' : inventory_quantity
						}
					})
				});
				break;
			case "Import" :
				job.selectedproduct.forEach(async product => {
					var productInInventory = await Products.findById(product._id);
					var total_quantity;
					var inventory_quantity;
					total_quantity = productInInventory.total_quantity - product.quantity;
					inventory_quantity = productInInventory.inventory_quantity - product.quantity;
					await Products.findByIdAndUpdate(product._id,{
						$set : {
							'inventory_quantity' : inventory_quantity,
							'total_quantity' : total_quantity
						}
					})
				});
				break;
		}
		

		if(transactions.length > 0){
			transactions.forEach(async transaction => {
				await Client.findByIdAndUpdate(job.client,{
					$pull : {
						transactions : {
							$in : [transaction]
						}
					}
				})
	
				await Job.findByIdAndUpdate(req.params.id,{
					$pull : {
						transactions : {
							$in : [transaction]
						}
					}
				})
	
				let transactionForJob = await Transaction.findById(transaction);
				const transactionFile = path.join(__dirname, `../${transactionForJob.transactionLink}`)
				try{
					fs.unlink(transactionFile, function (err) {
						if (err) throw err;
						console.log('File deleted!');
					  });
				}catch(err){
					console.log(err)
				}
				await Transaction.findByIdAndRemove(transaction)
			})
		}

		await Client.updateMany({ jobs: req.params.id },{
			$pull: { jobs: {$in: [req.params.id]} } 
		});
		await Job.findByIdAndRemove(req.params.id);
		console.log('Job successfully removed');
	}
	catch (err) {console.log(err);}	
	req.flash("error", "Job has been deleted");
	res.redirect("/jobs");
});
	
module.exports = router;