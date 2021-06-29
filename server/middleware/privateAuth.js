const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../Utility/errorResponse')

//A protected function for successful logIn 
exports.protect = async( req, res, next) => {
    
    if (typeof req.headers.authorization !== 'string') {
return next(new ErrorResponse("NO auth token", 400))
      }

    let tokens = req.headers.authorization.split(' ');

    if (tokens.length < 2) {
       return next(new ErrorResponse("NO auth token", 400))
        return;
      }
 token = tokens[1];
    // if(req.headers.authorization && req.headers.authorization.startsWith("Bearer") && typeof req.headers.authorization === 'string'){
    //     token = req.headers.authorization.split(' ')[1]
    // }
    if(!token){
        return next(new ErrorResponse("NOT authorised to access this route", 401))
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
    if(!user){
        return next(new ErrorResponse("NO user found with this id", 404))
    }
    req.user = user;
    next();
    } catch (error){
        return next(new ErrorResponse("NOT authorized to access this route", 401))
    }
}