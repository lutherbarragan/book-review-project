//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const privateUserController = require('../controllers/privateUser');

//GLOBAL VARIABLES
const router = express.Router()


router.get('/:userId/profile', privateUserController.getProfile) 

router.get('/:userId/profile/edit', privateUserController.getEditProfile) 
router.post('/:userId/profile/edit', privateUserController.postEditProfile)

router.get('/:userId/profile/settings', privateUserController.getProfileSettings)
router.post('/:userId/profile/settings', privateUserController.postProfileSettings)

router.get('/:userId/review/:reviewId/edit', privateUserController.getEditReview);
router.post('/:userId/review/:reviewId/edit', privateUserController.postEditReview);

router.get('/:userId/review/:reviewId/delete', privateUserController.getDeleteReview);


module.exports = router