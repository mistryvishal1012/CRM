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
Products          = require("../models/product");
Quotation         = require("../models/quotation");

// Functions
let numberWithCommas = require("../functions/numberWithCommas");
let isLoggedIn = require("../functions/isLoggedIn");
let isAdministrator = require("../functions/isAdministrator");
let isManager = require("../functions/isManager");
let ObjectId = require("mongoose").Types.ObjectId;

router.get("/askQuotation",async(req,res)=>{
    let products;
    products = await Products.find({'isActive' : true}).populate("category");
    res.render("quotation/quotatio",{
        title : "quotation",
        products : products
    });
});

router.post("/askQuotation",async(req,res)=>{
    let quotation;
    try{
        quotation = req.body.dealer;
        quotation = new Quotation(quotation);
        quotation.save();
        res.render("quotation/quotationDetails",{
            title : "quotation",
            dealer : quotation
        })
    }catch(err){
        console.log(err);
    }
});


router.get("/GetQuotation",async(req,res)=>{
    res.render("quotation/getQuotations",{
        title : "quotation"
    })
});

router.post("/getQuotation",async(req,res)=>{
    let quotation;
    try {
        quotation = await Quotation.find({
            'quotation_id' : req.body.dealer.quotation_number
        });
        
        quotation = await Quotation.find({
            $and : [
                {
                    'quotation_id' : req.body.dealer.quotation_number
                },{
                    'username' : req.body.dealer.username
                },{
                    'company_name' : req.body.dealer.company_name
                }
            ]
        })
        console.log(quotation)
        if(!quotation.length > 0){
            req.flash("error","No Quotation Found For That Record")
            res.redirect("/quotation/askQuotation")
        }else{
            res.render("quotation/quotationDetails",{
                title : "quotation",
                dealer : quotation[0]
            })
        }
    } catch (error) {
        console.log(error);
    }
    /*res.render("quotation/getQuotations",{
        title : "quotation"
    })*/
});

router.get("/",isLoggedIn,isManager,async(req,res)=>{
    let quotations;
    try{
        quotations = await Quotation.find();
        res.render("quotation/quotations",{
            title : "quotation",
            quotations : quotations
        })
    }catch(err){
        console.log(err);
    }
});

router.get("/:id",isLoggedIn,isManager,async(req,res)=>{
    console.log(req.params.id)
    let quotation;
    try{
        if(!ObjectId.isValid(req.params.id)){
            req.flash("error","Quotation Does not Exits");
            return res.redirect("/quotations");
        }
        quotation = await Quotation.findById(req.params.id);
        if(!quotation){
            req.flash("error","Quotation Does not Exits");
            return res.redirect("/quotations")
        }
        quotations = await Quotation.findById(req.params.id);
        res.render("quotation/quotationDetailsAdmin",{
            title : "quotation",
            quotation : quotation
        })
    }catch(err){
        console.log(err);
    }
});


module.exports = router;