const Transaction = require ("./transaction");
User 			  = require ("./user");
Ticket 	  		  = require ("./ticket");
Job 	   		  = require ("./job");
Client 			  = require ("./client");

mongoose          = require("mongoose");

// =======================Job Schema

var jobSchema = new mongoose.Schema({
	job_name: String,
	created_by: {type: mongoose.Schema.Types.ObjectID, ref: "User"},
	street: String,
	city: String,
	state: String,
	zip: String,
	description: String,
	billing_price: Number,
	tax_price : Number,
	total_price : Number,
	client: {type: mongoose.Schema.Types.ObjectID, ref: "Client"},
	transactions: [{type: mongoose.Schema.Types.ObjectID, ref: "Transaction"}],
	start_date: {type: Date},
	end_date: {type: Date},
	date_added: {type: Date, default: Date.now},
	job_type : {
		type : String,
		enum : ["Import","Export"]
	},
	remaining_amount : Number,
	selectedproduct: [
        {   _id:  { type : mongoose.Schema.Types.ObjectID, ref: "Product" },
            name:  {
                type : String,
                text : true
            },
            quantity:  {
                type : Number
            } 
        }
    ],
});

module.exports = mongoose.model("Job", jobSchema);