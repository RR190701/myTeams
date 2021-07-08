const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
// const crypto = require("crypto")

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required:[true, "Please provide a username"],   
        unique:true

    },
    password: {
        type:String,
        required:[true, "Please provide a password"],
        minlength:6,
        select:false,
    },
        roomID: {
            type:String
        }

    
});

//before saving user to database
userSchema.pre("save", async function(){

    //if the password is not changed
    if(!this.isModified("password")){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

//for checking password during login
userSchema.methods.matchPasswords = async function(password){
    return await bcrypt.compare(password,this.password);
}
    
//for getting a signed token for password reset
userSchema.methods.getSignedToken = function(){
        return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
}
    


const User = mongoose.model("User", userSchema); 

module.exports = User;