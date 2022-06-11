const { customAlphabet } = require('nanoid')
const { nanoid } = require("nanoid");
const mongoose          = require("mongoose");

// =======================Ticket Schema

var quotationSchema = new mongoose.Schema({
    quotation_id :{
        type: String,
        required: true,
        default: customAlphabet('1234567890', 6),
        index: { unique: true }
    },
    first_name: {
        type : String,
        text : true
    },
    middle_name: {
        type : String,
        text : true
    },
    last_name: {
        type : String,
        text : true
    },
    username : {
        type : String,
        text : true
    },
    phone_number: {
        type : String,
        text : true
    },
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
    date_added : {
        type : Date,
        default : Date.now()
    },
    billing_price : Number
});


module.exports = mongoose.model("Quotation", quotationSchema);