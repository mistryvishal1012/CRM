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
Category = require("../models/categories");
Product = require("../models/product");

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

router.get("/",isLoggedIn,async(req,res)=>{
    let products;
    try {
        products = await Product.find({}).populate("category");
        res.render("products/products",{
            title : "products",
            products : products
        })
    } catch (error) {
        console.log(error);
    }
});

router.get("/category/:id",isLoggedIn,async(req,res)=>{
    let category;
    let products;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Category Does not Exits");
			return res.redirect("/products");
		}
		category = await Category.findById(req.params.id);
		if(!category){
			req.flash("error","Category Does not Exits");
			return res.redirect("/products")
		}
        category = await Category.findById(req.params.id);
        products = await Product.find({'category' : `${req.params.id}`})
        res.render("products/categoryDetails",{
            title : "products",
            category : category,
            products : products
        })
    } catch (error) {
        console.log(error)
    }
});

router.get("/product/:id",isLoggedIn,async(req,res)=>{
    let product;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products");
		}
		product = await Product.findById(req.params.id);
		if(!product){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products")
		}
        product = await Product.findById(req.params.id).populate("category");
        res.render("products/productDetails",{
            title : "products",
            product : product
        })
    } catch (error) {
        console.log(error)
    }
});

router.get("/category/:id/edit",isLoggedIn,isManager,async(req,res)=>{
    let category;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Category Does not Exits");
			return res.redirect("/products");
		}
		category = await Category.findById(req.params.id);
		if(!category){
			req.flash("error","Category Does not Exits");
			return res.redirect("/products")
		}
        category = await Category.findById(req.params.id)
        res.render("products/editCategory",{
            title : "products",
            category : category
        })
    } catch (error) {
        console.log(error)
    }
});

router.get("/product/:id/edit",isLoggedIn,isManager,async(req,res)=>{
    let product;
    let categorys;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products");
		}
		product = await Product.findById(req.params.id);
		if(!product){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products")
		}
        product = await Product.findById(req.params.id).populate("category");
        categorys = await Category.find({});
        res.render("products/editProduct",{
            title : "products",
            product : product,
            categorys : categorys
        })
    } catch (error) {
        console.log(error)
    }
});

router.put("/category/:id/edit",isLoggedIn,isManager,async(req,res)=>{
    let category;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Category Does not Exits");
			return res.redirect("/products");
		}
		category = await Category.findById(req.params.id);
		if(!category){
			req.flash("error","Category Does not Exits");
			return res.redirect("/products")
		}
        category = await Category.findByIdAndUpdate(req.params.id,req.body.category);
        res.redirect("/products");
    } catch (error) {
        console.log(error)
    }
});

router.put("/product/:id/edit",isLoggedIn,isManager,async(req,res)=>{
    console.log(req.body);
    let product;
    let categorys;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products");
		}
		product = await Product.findById(req.params.id);
		if(!product){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products")
		}
        product = await Product.findByIdAndUpdate(req.params.id,req.body.product)
        /*product = await Product.findById(req.params.id).populate("category");
        categorys = await Category.find({});*/
        /*res.render("products/editProduct",{
            title : "products",
            product : product,
            categorys : categorys
        })*/
        res.redirect("/products")
    } catch (error) {
        console.log(error)
    }
});

router.delete("/product/:id/delete",isLoggedIn,isManager,async(req,res)=>{
    let product;
    let categorys;
    try {
        if(!ObjectId.isValid(req.params.id)){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products");
		}
		product = await Product.findById(req.params.id);
		if(!product){
			req.flash("error","Product Does not Exits");
			return res.redirect("/products")
		}
        product = await Product.findByIdAndUpdate(req.params.id,{
            $set : {
                'isActive' : false 
            }
        })
        /*product = await Product.findById(req.params.id).populate("category");
        categorys = await Category.find({});*/
        /*res.render("products/editProduct",{
            title : "products",
            product : product,
            categorys : categorys
        })*/
        res.redirect("/products")
    } catch (error) {
        console.log(error)
    }
});

router.get("/addCategory",isLoggedIn,isManager,async(req,res)=>{
    res.render("products/addCategory",{
        title : "products"
    })
});

router.get("/addProduct",isLoggedIn,async(req,res)=>{
    let categorys;
    categorys = await Category.find({});
    res.render("products/addProduct",{
        title : "products",
        categorys : categorys
    })
});

router.post("/addCategory",isLoggedIn,isManager,async(req,res)=>{
    let category;
    try{
        category = req.body.category;
        category = new Category(category);
        category.save();
        res.redirect("/products");
    }catch(err){
        console.log(err)
    }
    console.log(req.body)
});

router.post("/addProduct",isLoggedIn,isManager,async(req,res)=>{
    let product;
    try{
        product = req.body.product;
        product = new Product(product);
        product.save();
        res.redirect("/products");
    }catch(err){
        console.log(err)
    }
    console.log(req.body)
});

module.exports = router;