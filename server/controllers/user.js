//we will create controller fuctions for all the routes in this file
const User = require("./../models/User");
const ErrorResponse = require("./../utility/errorResponse");


const register = async (req, res, next) => {
  const { username, password} = req.body;

  if (!username||!password) {
    //sending error
    return next(new ErrorResponse("please provide (password/ username)", 400));
  }
  try {

    const user = await User.create({
      username,
      password
    });

    sendToken(user, 201, res, user.username);

  } catch (error) {
    //sending error
    next(error);
  }
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    //sending error
    return next(new ErrorResponse("please provide a username and password", 400));
  }

  //now to check if the user already exist or not!!
  try {
    const user = await User.findOne({ username }).select("password");


    if (!user) {
      //sending error
      return next(
        new ErrorResponse("invalid username", 401)
      );
    }

    //checking if password match
    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      //sending error
      return next(
        new ErrorResponse("wrong password"),
        401
      );
    }
 sendToken(user, 200, res, username );
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
