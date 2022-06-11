const mongoose = require("mongoose");

// =======================Client Schema

var activitySchema = new mongoose.Schema({
    activity_type : {
        type : String,
		enum : ['Meeting','Call','Task'],
		text : true
    },
    other_activity:{
        type : Boolean,
        default :false
    },
    for_lead : {
        type : mongoose.Schema.Types.ObjectID,
        ref : "Lead"
    },
    created_by : {
        type: mongoose.Schema.Types.ObjectID, ref: "User"
    },
    extra_notes : {
        type : String
    },
    active : {
        type : Boolean,
        default : true
    },
    activity_date : {
        type : Date
    },
    date_added : {
        type : Date,
        default : Date.now()
    },
    completion_activity : {
        type : String
    }
})


module.exports = mongoose.model("Activity", activitySchema);