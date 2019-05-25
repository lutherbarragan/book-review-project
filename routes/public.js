//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const publicController = require('../controllers/public')

//GLOBAL VARIABLES
const router = express.Router()

router.get('/', publicController.getIndex)

router.post('/search', publicController.postSearch)
router.get('/search', publicController.getSearch)

router.get('/signup', publicController.getSignup)
router.post('/signup', publicController.postSignup)

router.get('/login', publicController.getLogin)
router.post('/login', publicController.postLogin)




module.exports = router