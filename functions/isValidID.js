const ObjectId =  require("mongoose").Types.ObjectId;

function isValidID(req,res,next){
    if(ObjectId.isValid(req.params.id)){
        console.log("Valid");
        next();
    }else{
        console.log("InValid");
        next()
    }
}

module.exports = isValidID;