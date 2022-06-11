const express    = require("express"),
router			 = express.Router();

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

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get("/",isLoggedIn,async (req,res) => {
    let activitys;
    try{
        activitys = await Activity.find({
            $and: [
                {'other_activity' : true },
                { 'created_by' : req.user.id }
             ]
                
        }).populate("created_by").sort({ activity_date : 1})
    }catch(error){
        console.log(error)
    }
    res.render("activity/activity",{
        activityGET : activitys,
        title : "activitys"
    })
});

router.get("/add",isLoggedIn,async (req,res) => {
    res.render("activity/add_activity",{
        title : "activitys"
    })
});

router.get("/:id",isLoggedIn,async (req,res) => {
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
        activity = await Activity.findById(req.params.id).populate("created_by").sort({ activity_date : 1})
    }catch(error){
        console.log(error)
    }
    res.render("activity/activitydetails",{
        activity : activity,title : "activitys"
    })
});

router.get("/:id/edit",isLoggedIn,async (req,res) => {
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
        activity = await Activity.findById(req.params.id).populate("created_by").sort({ activity_date : 1})
    }catch(error){
        console.log(error)
    }
    res.render("activity/edit_activity",{
        activity : activity,title : "activitys"
    })
});

router.get("/:id/compelted",isLoggedIn,async(req,res)=>{
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
        activity = await Activity.findById(req.params.id).populate("created_by")
        res.render("activity/activitycomplete",{
            activity : activity,title : "activitys"
        })
    }catch(err){
        console.log(err);
    }
});

router.put("/:id/compelted",isLoggedIn,async(req,res)=>{
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
          
        activity = await Activity.findByIdAndUpdate(req.params.id,{
            $set : {
                'active' : false,
                'completion_activity' : req.body.activity.completion_activity
            }
        })

        res.redirect("/activity/"+req.params.id);
    }catch(err){
        console.log(err);
    }
});

router.post("/",isLoggedIn,async (req,res) => {
    let activity;
    try{
        activity = new Activity(req.body.activity);
        activity.other_activity = true;
        activity.created_by = req.user.id;
        activity.save();
    }catch(error){
        console.log(error)
    }

    req.flash("info","Activity Added Successfully");
    res.redirect("/activity")
});

router.put("/:id/edit",isLoggedIn,async (req,res) => {
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
        activity = await Activity.findByIdAndUpdate(req.params.id,req.body.activity);

    }catch(error){
        console.log(error)
    }

    req.flash("info","Activity Update Successfully");
    res.redirect("/activity/"+req.params.id)
});

router.put("/:id/complete",isLoggedIn,async (req,res) => {
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
        activity = await Activity.findByIdAndUpdate(req.params.id,{
            'active' : false
        });

    }catch(error){
        console.log(error)
    }

    req.flash("info","Activity Completed Successfully");
    res.redirect("/activity/"+req.params.id)
});

router.delete("/:id/delete",isLoggedIn,async (req,res) => {
    let activity;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/activity")
		}else{
            if(activity.created_by != req.user.id){
                req.flash("error","You Cannot Access This Activity Does");
			    return res.redirect("/activity")
            }
        }
        activity = await Activity.findByIdAndRemove(req.params.id)
    }catch(error){
        console.log(error)
    }

    req.flash("info","Activity Deleted Successfully");
    res.redirect("/activity")
});

module.exports = router;