const mongoose = require("mongoose");


// =======================Ticket Schema

var categoriesSchema = new mongoose.Schema({
	categorgy_name : String,
    category_description : String,
    tax : Number
});

module.exports = mongoose.model("Category", categoriesSchema);