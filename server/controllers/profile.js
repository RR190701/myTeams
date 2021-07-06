//to access private data after logIn
const User = require("./../models/User");
const ErrorResponse = require("./../utility/errorResponse");

exports.getPrivateData = async (req, res, next) => {
res.send("private route")
};
