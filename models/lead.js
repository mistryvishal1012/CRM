const mongoose = require("mongoose");

// =======================Client Schema

var leadSchema = new mongoose.Schema({
	first_name: {type :String,text : true},
	middle_name: {type :String,text : true},
	last_name: {type :String,text : true},
	username : {type :String,text : true},
	phone_number: {type :String,text : true},
    company_name : { type : String},
	company_address: {
		street: String,
		city: String,
		state: String,
		zip: String
	},
	comapny_emailAddress:{
		type : String
	},
	company_website : {
		type : String
	},
	active: {type : String,
		enum : ['Closed','Pending'],
		default : "Pending"
	},
	date_added: {type: Date, default : Date.now()},
	created_by: {type: mongoose.Schema.Types.ObjectID, ref: "User"},
	assigned_to : {
		type : mongoose.Schema.Types.ObjectID,
		ref : "User"
	},
    notes : { type : String},
    activities : [{type : mongoose.Schema.Types.ObjectID, ref : "Activity"}],
	approved : {
		type : Boolean,
		default : false
	},
	completeion_note : {
		type : String
	},
	lead_success : {
		type : String,
		enum : ["Success","Failure"]
	}
});


module.exports = mongoose.model("Lead", leadSchema);