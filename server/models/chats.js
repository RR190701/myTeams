const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
// const crypto = require("crypto")

const userSchema = new mongoose.Schema({

    sender: {
        type: String,
        required:true 

    },
    message: {
        type:String,
        required:true 
    },
    roomID: {
        type:String,
        required:true 
    }
    

});



const Message = mongoose.model("Massage", userSchema); 

module.exports = Message;