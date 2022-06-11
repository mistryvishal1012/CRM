const Transaction = require ("./transaction");
User 			  = require ("./user");
Ticket 	  		  = require ("./ticket");
Job 	   		  = require ("./job");
Client 			  = require ("./client");

mongoose          = require("mongoose");

// =======================Ticket Schema

var productSchema = new mongoose.Schema({
    product_name : String,
    product_description : {
        type : Object
    },
    category : {
        type : mongoose.Schema.Types.ObjectID, ref: "Category"
    },
    price : Number,
    total_quantity : {
        type : Number,
        default : 0
    },
    date_added : {
        type : Date,
        default : Date.now()
    },
    inventory_quantity : {
        type : Number,
        default : 0
    },
    isActive : {
        type : Boolean,
        default : true
    }
});


module.exports = mongoose.model("Product", productSchema);