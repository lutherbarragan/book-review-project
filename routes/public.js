//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const publicController = require('../controllers/public')

//GLOBAL VARIABLES
const router = express.Router()

router.get('/', publicController.getIndex)

router.post('/search', publicController.postSearch)
router.get('/search', publicController.getSearch)


module.exports = router