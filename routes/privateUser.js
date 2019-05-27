//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const privateUserController = require('../controllers/privateUser')

//GLOBAL VARIABLES
const router = express.Router()


router.get('/:userId/profile', privateUserController.getProfile) 
router.get('/:userId/profile/edit', privateUserController.getEditProfile) 


module.exports = router