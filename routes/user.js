const express    = require("express"),
router			 = express.Router();

// Schemas
const User		  = require ("../models/user");
Ticket 	  		  = require ("../models/ticket");
Job 	   		  = require ("../models/job");
Client 			  = require ("../models/client");

// Functions
let isLoggedIn = require("../functions/isLoggedIn");
let isAdministrator = require("../functions/isAdministrator");
let isAdministratorOrCurrentUser = require("../functions/isAdministratorOrCurrentUser");
let ObjectId = require("mongoose").Types.ObjectId;

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get("/me",isLoggedIn,async function(req,res){
	user = {};
		try {
			if(!ObjectId.isValid(req.user.id)){
				req.flash("error","User Does not Exits");
				return res.redirect("/users");
			}
			user = await User.findById(req.user.id);
			if(!user){
				req.flash("error","User Does not Exits");
				return res.redirect("/users")
			}
		}
		catch (err) {console.log(err);}

		return res.render("users/user", {user: user,title : "user"});
		
})

router.get("/:id",isAdministratorOrCurrentUser,async function(req,res){
	user = {};
		try {
			if(!ObjectId.isValid(req.params.id)){
				req.flash("error","User Does not Exits");
				return res.redirect("/users");
			}
			user = await User.findById(req.params.id);
			if(!user){
				req.flash("error","User Does not Exits");
				return res.redirect("/users")
			}
		}
		catch (err) {console.log(err);}

		return res.render("users/user", {user: user,title : "user"});
		
})

module.exports = router;