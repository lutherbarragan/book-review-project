//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const privateUserController = require('../controllers/privateUser');

//GLOBAL VARIABLES
const router = express.Router()


router.get('/user/:userId/profile', privateUserController.getProfile) 
router.get('/user/:userId/profile/edit', privateUserController.getEditProfile) 
router.post('/user/:userId/profile/edit', privateUserController.postEditProfile)

router.get('/user/:userId/profile/settings', privateUserController.getProfileSettings)
router.post('/user/:userId/profile/settings', privateUserController.postProfileSettings)

router.post('/review/:bookId', privateUserController.postReview)
router.get('/user/:userId/review/:reviewId/edit', privateUserController.getEditReview);
router.post('/user/:userId/review/:reviewId/edit', privateUserController.postEditReview);
router.get('/user/:userId/review/:reviewId/delete', privateUserController.getDeleteReview);

router.post('/book/:bookId/save', privateUserController.saveBook)
router.post('/book/:bookId/delete', privateUserController.deleteBook)


module.exports = router