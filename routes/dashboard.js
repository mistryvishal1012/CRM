const express    = require("express"),
router			 = express.Router();

// Schemas
const Transaction = require ("../models/transaction"),
Ticket 	  		  = require ("../models/ticket"),
Job 	   		  = require ("../models/job"),
Client 			  = require ("../models/client"),
Activity  		  = require ("../models/activity"),
lead			  = require ("../models/lead");

// Functions
let numberWithCommas = require("../functions/numberWithCommas");
let isLoggedIn = require("../functions/isLoggedIn");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

// =======================Dashboard

router.get("/", isLoggedIn, async function(req, res){ 
	let current_year = (new Date(Date.now())).getYear();
	let current_month = (new Date(Date.now())).getMonth();
	let transactions = [],
	clients = [],
	jobs = [],
	todayActivityLead = [],
	todayActivityOther = [],
	tickets = [];
	let totalActivityLead = 0;
	let totalActivityOther = 0;
	let outstanding_tickets = 0;
	let clients_added = 0;
	let jobs_added = 0;
	let ytd_income = 0;
	
	try {
		const foundTransactions = await Transaction.find({}).populate("job").populate("client").populate("deposited_by_user").exec();
		for (let y = 0; y < foundTransactions.length; y++){
			if (foundTransactions[y]["transaction_info"].date.getYear() == current_year){
				ytd_income = Number(ytd_income) + Number(foundTransactions[y]["transaction_info"].amount);
			}
		}
		ytd_income = numberWithCommas(ytd_income);

		for (let i = 0; i < foundTransactions.length; i++){
			foundTransactions[i]["transaction_info"]["new_amount"] = numberWithCommas(foundTransactions[i]["transaction_info"]["amount"]);
			}
		transactions = foundTransactions;
		
		clients = await Client.find({}).populate("transactions").populate("jobs").exec();
		tickets = await Ticket.find({}).populate("created_by").populate("assigned_user").populate("completed_by_user").exec();		
		jobs = await Job.find({}).populate("created_by").populate("client").populate("transactions").exec();
		
		
		for (let n = 0; n < tickets.length; n++){
			if (tickets[n].completed_date == null){
				outstanding_tickets = outstanding_tickets + 1;
			}		
		}

		for (let x = 0; x < clients.length; x++){
			if (clients[x].date_added.getMonth() == current_month){
				clients_added = clients_added + 1;
			}
		}	
		
		for (let r = 0; r < jobs.length; r++){
			if (jobs[r].date_added.getMonth() == current_month){
				jobs_added = jobs_added + 1;
			}
		}
		

		var start = new Date();
		start.setHours(0,0,0,0);

		var end = new Date();
		end.setHours(23,59,59,999);

		
		todayActivityLead = await Activity.find({
			$and : [
				{ 'activity_date' : {$gte: start, $lt: end}}
				,{
					'other_activity' : false
				},{
					'created_by' : req.user.id
				}
			]
		}).populate("for_lead created_by") 
		totalActivityLead = todayActivityLead.length;

		todayActivityOther = await Activity.find({
			$and : [
				{ 'activity_date' : {$gte: start, $lt: end}}
				,{
					'other_activity' : true
				},{
					'created_by' : req.user.id
				}
			]
		}).populate("for_lead created_by") 
		totalActivityOther = todayActivityOther.length;
	}	
	catch (err) {console.log(err);}
	
	res.render("dashboard", {ytd_income: ytd_income, clients_added: clients_added, outstanding_tickets: outstanding_tickets, jobs_added: jobs_added, todayActivityLead : todayActivityLead,totalActivityLead : totalActivityLead ,todayActivityOther : todayActivityOther,totalActivityOther : totalActivityOther, title:"dashboard"});	
});	

module.exports = router;