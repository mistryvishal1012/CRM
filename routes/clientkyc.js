const express    = require("express"),
router			 = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
let Detail = require('../models/detail');
let fs = require('fs');
let dir = './public/uploads/';

// Schemas
const Transaction = require ("../models/transaction");
User 			  = require ("../models/user");
Ticket 	  		  = require ("../models/ticket");
Job 	   		  = require ("../models/job");
Client 			  = require ("../models/client");
Lead              = require("../models/lead");
Activity          = require("../models/activity");

// Functions
let numberWithCommas = require("../functions/numberWithCommas");
let isLoggedIn = require("../functions/isLoggedIn");
let isAdministrator = require("../functions/isAdministrator");
let isManager = require("../functions/isManager");
let ObjectId = require("mongoose").Types.ObjectId;

let upload = multer({
	storage: multer.diskStorage({
  
	  destination: (req, file, callback) => {
		if (!fs.existsSync(dir)) {
		  fs.mkdirSync(dir);
		}
		callback(null, './public/Documents/');
	  },
	  filename: (req, file, callback) => { callback(null, file.fieldname + '-' + req.params.id + path.extname(file.originalname)); }
  
	}),
  
	fileFilter: (req, file, callback) => {
	  let ext = path.extname(file.originalname)
	  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext != '.pdf') {
		return callback(/*res.end('Only images are allowed')*/ null, false)
	  }
	  callback(null, true)
	}
  });

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get("/",isLoggedIn,isAdministrator,async(req,res)=>{
	let clients = [];
	try {
		clients = await Client.find({'client_type' : "Client"}).exec()
		console.log(clients);
	}
	catch (err) {console.log(err);}	
	res.render("clientkyc/clientskyc", {clients: clients,title:"clientkyc"});
});

router.get("/:id", isLoggedIn,isAdministrator, async function(req, res){
	let client_info = {};
	let client;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc");
		}
		client = await Client.findById(req.params.id);
		if(!client){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc")
		}
		client_info = await Client.findById(req.params.id).populate("KYCLink").exec();
	}
	catch (err) {console.log(err);}	
	res.render("clientkyc/clientkyc_info", {client_info: client_info,title:"clientkyc"});
});

router.get("/:id/edit", isLoggedIn,isAdministrator, async function(req, res){
	let client_info = {};
	let client;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc");
		}
		client = await Client.findById(req.params.id);
		if(!client){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc")
		}
		client_info = await Client.findById(req.params.id).populate("KYCLink").exec();
	}
	catch (err) {console.log(err);}	
	res.render("clientkyc/edit_clientkyc", {client_info: client_info,title:"clientkyc"});
});


router.get("/:id/:fileName",isLoggedIn,isAdministrator,async(req,res)=>{
	const fileFullForm = new Map([
		["CF", "Client Form"],
		["POO", "Photograph Of Business Owner"],
		["POBIE", "Proof of Business Identity & Existence"],
		["POIBO", "Proof of Identity of Business Owners"],
		["POABO", "Proof of Address of Business Owners"],
		["GSTCertificate","GST Certificate"]
	  ])
	let fileExtension;
	let client_info = {};
	let client;
	let certifictaeNumber;
	let certififcateLink;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc");
		}
		client = await Client.findById(req.params.id);
		if(!client){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc")
		}
		client_info = await Client.findById(req.params.id).populate("KYCLink").exec();
		certififcateLink = client_info.KYCLink[`${req.params.fileName}`].slice(6);
		fileExtension = client_info.KYCLink[`${req.params.fileName}`].split(".")[1];
		certifictaeNumber = (req.params.fileName === "CF" || req.params.fileName === "POO") ? "" : client_info.KYCLink[`${req.params.fileName}CertificateNumber`];
	}catch(err){
		console.log(err);
	}
	res.render("clientkyc/kycdocuments",{
		data : certififcateLink,
		title:"clientkyc",
		fileType : `${fileExtension}`,
		client_info : client_info,
		certifictaeNumber : certifictaeNumber,
		filename : fileFullForm.get(`${req.params.fileName}`)
	})
})

router.put("/:id", isLoggedIn,isAdministrator,upload.any(), async function(req, res){
	let client_info = {};
	let client;
	try {
		if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc");
		}
		client = await Client.findById(req.params.id);
		if(!client){
			req.flash("error","Client Does not Exits");
			return res.redirect("/clientkyc")
		}
		let kycDetails = {};
		kycDetails["client_id"] = req.params.id;
		let files = req.files;
		let detail = req.body.detail;
		for (var key of Object.keys(detail)) {
			console.log(key, detail[key])
			kycDetails[`${key}`] = detail[key] 
		}
		files.forEach(element => {
			kycDetails[`${element.fieldname}`] = element.path;
		})
		console.log(kycDetails)
		kycDetails = new Detail(kycDetails);
		kycDetails.save();
		await Client.findByIdAndUpdate(req.params.id,{
			$set : {
				'clientKYC' : true,
				'KYCLink' : kycDetails._id 
			}
		})
		client_info = await Client.findById(req.params.id).populate("KYCLink").exec();
	}
	catch (err) {console.log(err);}	
	res.redirect("/clientkyc/"+req.params.id);
});

module.exports = router;