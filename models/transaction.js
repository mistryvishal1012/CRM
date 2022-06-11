const { customAlphabet } = require('nanoid')
const { nanoid } = require("nanoid");
// Schemas
const Transaction = require ("./transaction");
User 			  = require ("./user");
Ticket 	  		  = require ("./ticket");
Job 	   		  = require ("./job");
Client 			  = require ("./client");

mongoose          = require("mongoose");


// =======================Transaction Schema

var transactionSchema = new mongoose.Schema({
	job: {type: mongoose.Schema.Types.ObjectId, ref: Job},
	client: {type: mongoose.Schema.Types.ObjectId, ref: Client},
	deposited_by_user: {type: mongoose.Schema.Types.ObjectId, ref: User},
	transaction_info:{
		associated_name: String,
		amount: Number,
		method: String,
		receipt_number: {
			type: String,
    		required: true,
    		default: customAlphabet('1234567890', 6),
    		index: { unique: true },
		},
		date: {type: Date}
	},
	billing_address: {
		street: String,
		city: String,
		state: String,
		zip: String
	},
	notes: String,
	transactionLink : String,
	date_added: {type: Date}
});

module.exports = mongoose.model("Transaction", transactionSchema);