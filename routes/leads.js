const express = require('express');
const router			 = express.Router();

// Schemas
const Activity =  require("../models/activity");
const Note = require("../models/note");
const Lead = require("../models/lead")
const User = require("../models/user")

// Functions
const isLoggedIn = require("../functions/isLoggedIn");
const isAdministrator = require("../functions/isAdministrator");
const isManager = require('../functions/isManager');
let ObjectId = require("mongoose").Types.ObjectId;

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get("/",isLoggedIn,isManager,async(req,res)=>{
    let leads;
    try{
        switch(req.user.user_permissions){
            case 'Administrator':
                    leads = await Lead.find().populate("created_by assigned_to")
                    break;    
            case "Manager":
                leads = await Lead.find({
                    $or : [
                        {
                            'created_by' : req.user.id
                        },
                        {
                            'assigned_to' : req.user.id
                        }
                    ]
                }).populate("created_by assigned_to") 
                break;
        }
        /*return res.status(200).json({
            'leads' : leads
        })*/
    }catch(err){
        console.log(err);
        return res.status(500).json({
            'message' : 'Server Problem'
        })
    }
    res.render("leads/leads",{leads : leads,title : "leads"})
})

router.get("/add",isLoggedIn,isManager,async(req,res)=>{
    let users;
    users = await User.find({
       user_permissions :  { $in : [ "Manager", "Administrator" ] } 
    })
    res.render("leads/add_lead",{title : "leads",
    users : users});
});

router.get("/:id/activity/add",isLoggedIn,isManager,async(req,res) => {
    let lead;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads/"+req.params.id)
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
        lead = await Lead.findById(req.params.id).populate("created_by assigned_to");
    }catch(error){
        console.log(error)
    }

    res.render("leads/add_activity",{
        lead : lead,
        title : "leads"
    })
});

router.get("/:id/edit",isLoggedIn,isManager,async(req,res)=>{
    let lead;
    let users;
    try{
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id);
        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
        users = await User.find({ user_permissions :  { $in : [ "Manager", "Administrator" ] } } );

    }catch(error){
        console.log(error)
    }
    res.render("leads/edit_lead",{
        lead : lead,
        users : users,
        title : "leads"
    });
});

router.get("/:id",isLoggedIn, isManager, async(req,res)=>{
    let lead;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id).populate("created_by assigned_to activities");
        /*if(!lead){
            return res.status(404).json({
                'message' : 'Lead Not Found'
            })
        }*/
    
        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to._id != req.user.id && lead.created_by._id != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
       

        res.render("leads/lead",{lead : lead,title : "leads"})
        /*return res.status(200).json({
            'lead' : lead
        })*/
    } catch (error) {
        console.log(error);/*
        return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }
    
})

router.get("/:leadid/activity/:id",isLoggedIn,isManager,async(req,res)=>{
    let activity;
    let lead;
    try {
        if(!ObjectId.isValid(req.params.leadid)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.leadid);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}
        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
        activity = await Activity.findById(req.params.id).populate("for_lead created_by")
    } catch (error) {
        console.log(error);
    }

    console.log(activity)
    res.render("leads/activity",{
        activity : activity,title : "leads"
    })
});

router.get("/:leadid/activity/:id/complete",isLoggedIn,isManager, async function(req,res){
    let activity;
    let lead;
    let users;
    try{
        if(!ObjectId.isValid(req.params.leadid)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.leadid);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.leadid).populate("for_lead created_by")
        
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
        activity = await Activity.findById(req.params.id).populate("for_lead created_by")

        users = await User.find({ user_permissions :  { $in : [ "Manager", "Administrator" ] } })
        res.render("leads/activitycomplete",{
            title : "lead",
            activity : activity,
            lead : lead,
            users : users
        })
    }catch(err){

    }
})

router.get("/:leadid/activity/:id/edit",isLoggedIn,isManager,async(req,res)=>{
    let activity;
    let lead;
    try {
        if(!ObjectId.isValid(req.params.leadid)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.leadid);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
        
        activity = await Activity.findById(req.params.id).populate("for_lead created_by")
      
    } catch (error) {
        console.log(error);
    }

    console.log(activity)
    res.render("leads/edit_activity",{
        activity : activity,title : "leads"
    })
});

router.put("/:id/approved",isLoggedIn,isAdministrator,async(req,res)=>{
    let lead;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}

        lead = await Lead.findByIdAndUpdate(req.params.id,{
            $set : {
                'approved' : true
            }
        })

        /*return res.status(200).json({
            'lead' : lead
        })*/
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash("info", "Laed has been APPROVED");
    res.redirect("/leads/"+req.params.id);
})

router.put("/:id/disapprove",isLoggedIn,isAdministrator,async(req,res)=>{
    let lead;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}

        lead = await Lead.findByIdAndUpdate(req.params.id,{
            $set : {
                'approved' : false
            }
        })

        /*return res.status(200).json({
            'lead' : lead
        })*/
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash("info", "Laed has been DISAPPROVED");
    res.redirect("/leads/"+req.params.id);
})

router.post("/",isLoggedIn,isManager,async(req,res)=>{
    console.log(req.body)
    let lead;
    try{
        lead = req.body.lead;
        lead.created_by = req.user.id;
        lead.zone = [req.user.zone_assigned];
        if(req.user.user_permissions === "Administrator"){
            lead.approved = true;
        }
        
        if(!lead.assigned_to){
            lead.assigned_to = req.user.id;
        }

        const leadToCreate = new Lead(lead);
        await leadToCreate.save();
        /*return res.status(200).json({
            'message' : "Lead Created Successfully",
            "lead" : leadCreated
        })*/
    }catch(err){
        console.log(err)
        /*return res.status(500).json({
            'message' : 'Server Error'
        })*/
    }
    req.flash("success", "New Lead has been created");
	res.redirect("/leads");
})

router.put("/:id",isLoggedIn,isManager,async(req,res)=>{
    console.log(req.body)
    let lead;
    let leadToUpdate;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id)
        

        leadToUpdate = req.body.lead;

        console.log("Final Lead",leadToUpdate)

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
      

        lead = await Lead.findByIdAndUpdate(req.params.id,req.body.lead)

        /*return res.status(200).json({
            'lead' : lead
        })*/
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash('info',"Lead Updated Successfully")
    res.redirect('/leads/'+req.params.id)
})

router.get("/:id/compelted",isLoggedIn,isManager,async(req,res)=>{
    let lead;
    let users;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id)
       
        lead = await Lead.findById(req.params.id);
        users = await User.find()
        

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
      

        lead = await Lead.findByIdAndUpdate(req.params.id)

        //res.redirect("/leads"+req.params.id)
        /*return res.status(200).json({
            'lead' : lead
        })*/
        res.render("leads/completeLead",{
            lead : lead,
            users : users,
            title : "Lead"
        })
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }
})

router.put("/:id/compelted",isLoggedIn,isManager,async(req,res)=>{
    let lead;
    try {   
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id)
        

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }

        lead = await Lead.findByIdAndUpdate(req.params.id,{
            $set : {
                'active' : 'false',
                'completeion_note' : req.body.lead.completeion_note,
                'lead_success' : req.body.lead.lead_success
            }
        })

        //res.redirect("/leads"+req.params.id)
        /*return res.status(200).json({
            'lead' : lead
        })*/
        res.redirect("/leads/"+req.params.id);
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }
})

router.put("/:id/activity",isLoggedIn,isManager,async(req,res)=>{
    let lead;
    let activity;
    console.log(req.body);
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id)
        

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }

        activity = new Activity(req.body.activity)
        activity.for_lead = req.params.id;
        activity.created_by = req.user.id;

        activity.save();

        console.log(activity)

        lead = await Lead.findByIdAndUpdate(req.params.id,{
            $push : {
                'activities' : activity._id
            }
        })

        /*return res.status(200).json({
            'lead' : lead
        })*/
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash("info","Activity Added Successfully")
    res.redirect("/leads/"+req.params.id)
})

router.delete("/:id/activity/:activityId",isLoggedIn,isManager,async(req,res)=>{
    let lead;
    let activity;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.id);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.id)
        if(!ObjectId.isValid(req.params.activityId)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.activityId);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }


        lead = await Lead.findByIdAndUpdate(req.params.id,{
            $pull : {
                'activities' : req.params.activityId
            }
        })

        await Activity.findByIdAndRemove(req.params.activityId);

        return res.status(200).json({
            'lead' : lead
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            'message' : 'Server Problem'
        })
    }
})


router.put("/:leadid/activity/:id/",isLoggedIn,isManager,async(req,res)=>{
    console.log("Actiity Lead")
    let lead;
    let activity;
    let note;
    try {
        console.log("ACtivity Edit Lead",req.params.leadid)
        if(!ObjectId.isValid(req.params.leadid)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.leadid);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.leadid)
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }

        await Activity.findByIdAndUpdate(req.params.id,req.body.activity);
        
        /*return res.status(200).json({
            'activity' : activity
        })*/
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash("info","Activity Updated Sucessfully")
    res.redirect("/leads/"+req.params.leadid)
})

router.put("/:leadid/activity/:id/compelted",isLoggedIn,isManager,async(req,res)=>{
    console.log("ACTIVITY COMPLETED")
    let lead;
    let activity;
    try {
        if(!ObjectId.isValid(req.params.leadid)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.leadid);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.leadid)
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}

        if(req.user.user_permissions != "Administrator"){
            if(lead.assigned_to != req.user.id && lead.created_by != req.user.id){
                req.flash('error',"You Do not have Right To Access It")
                return res.render("/leads")
                /*return res.status(403).json({
                    'message' : 'Lead Permissions Forbeddien'
                })*/
            }
        }
        
        activity = await Activity.findByIdAndUpdate(req.params.id,{
            $set : {
                'active' : false,
                'completion_activity' : req.body.activity.completion_activity
            }
        })

        console.log(activity)
        /*return res.status(200).json({
            'activity' : activity
        })*/

        //res.render("leads/"+req.params.id)
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash("info","Lead Completed")
    res.redirect("/leads/"+req.params.leadid);
})

router.post("/:leadid/activity/:id/delete",isLoggedIn,isManager,async(req,res)=>{
    let lead;
    let activity;
    let note;
    try {
        if(!ObjectId.isValid(req.params.leadid)){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads");
		}
		lead = await Lead.findById(req.params.leadid);
		if(!lead){
			req.flash("error","Lead Does not Exits");
			return res.redirect("/leads")
		}
        lead = await Lead.findById(req.params.leadid)
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads");
		}
		activity = await Activity.findById(req.params.id);
		if(!activity){
			req.flash("error","Activity Does not Exits");
			return res.redirect("/leads")
		}
        activity = await Activity.findById(req.params.id);
        if(!activity){
            /*return res.status(404).json({
                'message' : 'Activity Not Found'
            })*/
        }

        if(lead.assigned_to != req.user.id  &&  lead.created_by != req.user.id){
            /*return res.status(403).json({
                'message' : 'Permissions Forbeddien'
            })*/
        }
        

        console.log("DELETED")
        activity = await Activity.findByIdAndDelete(req.params.id)


        /*return res.status(200).json({
            'activity' : activity
        })*/
    } catch (error) {
        console.log(error);
        /*return res.status(500).json({
            'message' : 'Server Problem'
        })*/
    }

    req.flash("info","Lead Deleted Successfully");
    res.redirect("/leads/"+req.params.leadid)
})

module.exports = router;