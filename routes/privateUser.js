//3RD-PARTY MODULES
const express = require('express')

//CONTROLLERS
const privateUserController = require('../controllers/privateUser')


const multer = require('multer');
const cloudinary = require('cloudinary');

// const storage = multer.diskStorage({
//     filename: (re, file, callback) => {
//         callback(null, Date.now() + file.originalname);
//     }
// });

const storage = multer.memoryStorage()

const imageFilter = (req, file, cb) => {
    //accept images files only
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}



// const upload = multer({storage: storage, fileFilter: imageFilter});
const upload = multer({
    storage: storage
});


//GLOBAL VARIABLES
const router = express.Router()


router.get('/:userId/profile', privateUserController.getProfile) 

router.get('/:userId/profile/edit', privateUserController.getEditProfile) 
router.post('/:userId/profile/edit', privateUserController.postEditProfile)

router.get('/:userId/review/:reviewId/edit', privateUserController.getEditReview);
// router.post('/:userId/review/:reviewId/edit', upload.single('profileImage'), privateUserController.postEditReview);
router.post('/:userId/review/:reviewId/edit', privateUserController.postEditReview);

router.get('/:userId/review/:reviewId/delete', privateUserController.getDeleteReview);


module.exports = router