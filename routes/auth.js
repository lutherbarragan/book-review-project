//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const authController = require('../controllers/auth')

//GLOBAL VARIABLES
const router = express.Router()

router.get('/signup', authController.getSignup)
router.post('/signup', authController.postSignup)

router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)

router.get('/logout', authController.getLogout) 


module.exports = router