const mongoose = require("mongoose");


const noteSchema = new mongoose.Schema({
    notes_action : String
});

module.exports = mongoose.model("Notes", noteSchema);