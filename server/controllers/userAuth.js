//we will create controller fuctions for all the routes in this file
const User = require("./../models/User");
const ErrorResponse = require("./../Utility/errorResponse");
// const sendEmail = require("../utils/sendEmail");
// const crypto = require("crypto")
// const bcrypt = require("bcryptjs");


const register = async (req, res, next) => {
  const { username, email, password} = req.body;

  if (!username||!email||!password) {
    //sending error
    return next(new ErrorResponse("please provide an (email/ password/ username)", 400));
  }
  try {

    const user = await User.create({
      username,
      email,
      password
    });

    sendToken(user, 201, res, user.username);

  } catch (error) {
    //sending error
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    //sending error
    return next(new ErrorResponse("please provide an email and password", 400));
  }

  //now to check if the user already exist or not!!
  try {
    const user = await User.findOne({ email }).select("password").select("username");


    if (!user) {
      //sending error
      return next(
        new ErrorResponse("invalid Email", 401)
      );
    }

    //checking if password match
    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      //sending error
      return next(
        new ErrorResponse("wrong password",401 ));
    }
 sendToken(user, 200, res, user.username);
  } catch (error) {
    //sending error
    next(error);
  }
};


//A function that create a signed jwt token for the authentication of the user
const sendToken = (user, statusCode, res, username) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token, username });
};

module.exports = { register, login};
