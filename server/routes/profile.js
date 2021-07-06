//A private route that will be only
const express = require('express');
const router =  express.Router();
const {getPrivateData} = require('../controllers/profile')
const { protect } = require('../middleware/privateAuth')



router.route("/:username").get(protect, getPrivateData);


module.exports = router;