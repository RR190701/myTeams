//creating our APIs
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.route("/").get((req, res) => {
    res.status(200).json({
        success:"welcome to microsoft teams clone"
    })
    });

router.route("/getRoomID").get((req, res) => {
    res.status(200).json({
        roomID:uuidv4()
    })
    });




module.exports = router;