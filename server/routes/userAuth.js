//creating our APIs
const express = require("express");
const router = express.Router();
const {register, login} = require("./../controllers/userAuth")

router.route("/register").post(register);

router.route("/login").post(login);




module.exports = router;