//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const publicController = require('../controllers/public')

//GLOBAL VARIABLES
const router = express.Router()

router.get('/', publicController.getIndex)


module.exports = router