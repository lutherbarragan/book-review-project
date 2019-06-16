const User = require('../models/User');
const Review = require('../models/Review');

const bcrypt = require('bcryptjs');
const multer = require('multer');
const cloudinary = require('cloudinary');
const path = require('path');
const Datauri = require('datauri');
const dUri = new Datauri();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getProfile = (req, res, next) => {
    const userId = req.params.userId;
    let isOwnUserProfile = false
    let createdAt;

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect('/login')
            }
            
            createdAt = user.createdAt.toString().split('').map((c, i) => {
                if(i <= 14 && i > 3) {
                    return c
                }
            }).join('')

            if(user._id.toString() === req.user._id.toString()) { 
                isOwnUserProfile = true
            }

            return user

        })
        .then(user => {
            Review.find({author: user._id})
                .populate('author')
                .exec()
                .then(userReviews => {

                    res.render('private/profile', {
                    pageTitle:`${user.username}'s Profile`, 
                    pageRoute: '/profile',
                    profilePicUrl: user.profilePicUrl,
                    username: user.username,
                    email: user.email,
                    memberSince: createdAt,
                    booksRead: user.reviews.length,
                    reviews: userReviews,
                    isUserProfile: isOwnUserProfile,
                    url: req.url,
                    userId
                })

            })
        })
        .catch(err => {
            console.log(':::::No user found:::::', err)
            res.redirect('/login')
        })

}

exports.getEditProfile = (req, res, next) => {
    const userId = req.params.userId;
    console.log('USERID EDIT: ', userId)

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect(`/user/${req.user._id}/profile`)
            }

            if(req.user._id.toString() === user._id.toString()) {
                res.render('private/profile-edit', {
                    pageTitle:`${user.username}'s Profile`, 
                    pageRoute: '/profile',
                    username: user.username,
                    email: user.email,
                    url: req.url,
                    inputErrors: []
                })
            } else {
                res.redirect(req.profileUrl)
            }

        })
        .catch(err => console.log(':::::GET EDIT ERROR:::::', err))
}

exports.postEditProfile = (req, res, next) => {
    const storage = multer.memoryStorage()
    const upload = multer({ storage: storage }).single('profileImage')
    
    upload(req, res, (err) => {
        //MULTER ERRORS
        if (err instanceof multer.MulterError) {
            console.log('ERR1: ', err)
            // A Multer error occurred when uploading.
        } else if (err) {
            console.log('ERR???: ', err)
            // An unknown error occurred when uploading.
        }
        const userId = req.params.userId;
        const newUsername = req.body.username;
        const newEmail = req.body.email.toLowerCase();
        const inputErrors = []

        const dataUri = req => {
            return dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer)
        }

        console.log("REQ BODY: ", req.body)
        console.log("REQ FILE: ", req.file)
        
        User.findById(userId)
            .then(user => {
                //INVALID USER ERRROS
                if(!user) {
                    res.redirect(`/user/${req.user._id}/profile/edit`) //No user found
                }
                if(user._id.toString() !== req.user._id.toString()) {//Diferent user
                    res.redirect(`/user/${req.user._id}/profile/edit`)
                }
                //INVALID INPUT VALUES ERRORS
                if(newUsername.trim() === "") { //invalid username value
                    inputErrors.push({
                        param: "invalidUsername=true"
                    })
                }
                if(newEmail.trim() === "") { //invalid email value
                    inputErrors.push({
                        param: "invalidEmail=true"
                    })
                }

                // if the input values are NOT emty strings
                if(newUsername.trim() !== "" && newEmail.trim() !== "") { 
                    return user                
                } else { //if invalid input values
                    
                    //Render with error messages
                    res.render('private/profile-edit', {
                        pageTitle:`${user.username}'s Profile`,
                        pageRoute: '/profile',
                        username: newUsername,
                        email: newEmail,
                        url: req.url,
                        inputErrors: inputErrors
                    })
                }
            })
            .then(user => {
                //SET USERNAME & EMAIL
                user.username = newUsername;
                user.email = newEmail;
                
                if(req.file) {
                    //IF IMAGE IS THE RIGHT EXTENTION
                    if(req.file.mimetype === 'image/jpeg' ||
                     req.file.mimetype === 'image/jpg' ||
                     req.file.mimetype === 'image/png') {
                        return user;
                    } else {
                        inputErrors.push({
                            param: "invalidImage=true"
                        })
    
                        //Render with error messages
                        res.render('private/profile-edit', {
                            pageTitle:`${user.username}'s Profile`,
                            pageRoute: '/profile',
                            username: newUsername,
                            email: newEmail,
                            url: req.url,
                            inputErrors: inputErrors
                        })

                        throw new Error("Image file invalid");
                    }                             
                } else {
                    user.save();
                    res.redirect(`/user/${req.user._id}/profile`)
                }
            })
            .then(user => {
                // UPLOAD, SAVE & REDIRECT!
                const file = dataUri(req).content;
                cloudinary.v2.uploader.upload(file, (err, result) => {
                    if(err) {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~ERR",err);         
                    }
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~RESULT",result);

                    user.profilePicUrl = result.secure_url;
                    user.save();

                    res.redirect(`/user/${req.user._id}/profile`)
                });

            })
            .catch(err => console.log('@@@@@@@@@@@', err))
    }) 
}

exports.getProfileSettings = (req, res, next) => {
    const userId = req.params.userId;
    console.log('USERID SETTINGS: ', userId)

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect(`/user/${req.user._id}/profile`)
            }

            if(req.user._id.toString() === user._id.toString()) {
                
                res.render('private/profile-settings', {
                    pageTitle:`${user.username}'s Settings`, 
                    pageRoute: '/profile',
                    url: req.url,
                    inputErrors: []
                })
            } else {
                res.redirect(req.profileUrl)
            }

        })
        .catch(err => console.log(':::::GET EDIT ERROR:::::', err))
}

exports.postProfileSettings = (req, res, next) => {
    const userId = req.params.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword1 = req.body.newPassword1;
    const newPassword2 = req.body.newPassword2;
    const inputErrors = [];
    
    User.findById(userId)
        .then(user => {
            //INVALID USER ERRROS
            if(!user) {
                res.redirect(`/user/${req.user._id}/profile/settings`)  //No user found
            }
            if(user._id.toString() !== req.user._id.toString()) {   //Diferent user
                res.redirect(`/user/${req.user._id}/profile/settings`)
            }

            //INVALID INPUT VALUES ERRORS
            if(bcrypt.compareSync(oldPassword, user.password)) { // Correct (old/current) password
                console.log('CORRECT PASSWORD')
                return user;
            } else {
                inputErrors.push({
                    param: "invalidOldPassword=true"
                })
                console.log('WRONG PASSWORD')
                res.render('private/profile-settings', {
                    pageTitle:`${user.username}'s Settings`, 
                    pageRoute: '/profile',
                    url: req.url,
                    inputErrors
                })
            }
        })
        .then(user => { //CORRECT OLD PASSWORD
            if(newPassword1.trim() === "" || newPassword1.trim().length < 5) { //invalid new password 1 value
                inputErrors.push({
                    param: "invalidNewPassword1=true"
                })
            }
            if(newPassword2.trim() !== newPassword1.trim()) { //invalid password 2 value
                inputErrors.push({
                    param: "invalidNewPassword2=true"
                })
            }

            if(inputErrors.length > 0) { // render with error msgs
                res.render('private/profile-settings', {
                    pageTitle:`${user.username}'s Settings`, 
                    pageRoute: '/profile',
                    url: req.url,
                    inputErrors
                })
            } else {
                return user
            }

        })
        .then(user => {
            console.log('ALL VALIDATIONS PASSSED!!')
        })
        .catch(err => {
            console.log('PASSWORD EDIT ERROR', err)
        })


    // res.redirect(`/user/${req.user._id}/profile`)
}

exports.getEditReview = (req, res, next) => {
    const userId = req.params.userId
    const reviewId = req.params.reviewId
    
    User.findById(userId)
        .then(user => {
            if(!user) {
                console.log('NO USER')
                res.redirect(`/user/${req.user._id}/profile`)
            }
            
            if(user._id.toString() !== req.user._id.toString()) {
                console.log('NO AUTH')
                res.redirect(`/user/${req.user._id}/profile`)
            }
            
            const userReview = user.reviews.find(r => r._id.toString() === reviewId.toString())
            
            
            if(userReview) {
                Review.findById(reviewId)
                    .then(review => {
                        res.render('private/review-edit', {
                            pageTitle: 'Edit Review',
                            pageRoute: '/review',
                            reviewTitle: review.title,
                            review: review.review,
                            reviewRating: review.rating,
                            formAction: req.url
                        })
                        
                    })
                
            } else {
                console.log('NO userReview')
                res.redirect(`/user/${req.user._id}/profile`)
            }  
        })
}

exports.postEditReview = (req, res, next) => {
    const userId = req.params.userId
    const reviewId = req.params.reviewId

    User.findById(userId)
        .then(user => {
            if(!user) {
                console.log('NO USER')
                res.redirect(`/user/${req.user._id}/profile`)
            }
            
            if(user._id.toString() !== req.user._id.toString()) {
                console.log('NO AUTH')
                res.redirect(`/user/${req.user._id}/profile`)
            }
            
            const userReview = user.reviews.find(r => r._id.toString() === reviewId.toString())
            
            
            if(userReview) {
                Review.findById(reviewId)
                    .then(review => {
                        const newTitle = req.body.newReviewTitle;
                        const newReview = req.body.newReview;
                        const newRating = req.body.newReviewRating;

                        review.title = newTitle;
                        review.review = newReview;
                        review.rating = newRating;
                        review.save();

                    })
                    .then(result => {
                        res.redirect(`/user/${req.user._id}/profile`)
                    })
                
            } else {
                console.log('NO userReview')
                res.redirect(`/user/${req.user._id}/profile`)
            }

        })


}


exports.getDeleteReview = (req, res, next) => {
    const userId = req.params.userId
    const reviewId = req.params.reviewId
    
    User.findById(userId)
        .then(user => {
            if(!user) {
                console.log('NO USER')
                res.redirect(`/user/${req.user._id}/profile`)
            }
            
            if(user._id.toString() !== req.user._id.toString()) {
                console.log('NO AUTH')
                res.redirect(`/user/${req.user._id}/profile`)
            }
            
            const userReview = user.reviews.find(r => r._id.toString() === reviewId.toString())
            
            
            if(userReview) {
                Review.findByIdAndDelete(reviewId)
                    .then(result => {
                        const newUserReviewsArr = user.reviews.filter(revs => revs.toString() !== reviewId.toString())
                        console.log('REVIEW DELETED')
                        user.reviews = newUserReviewsArr
                        
                        user.save()
                        res.redirect(`/user/${req.user._id}/profile`)
                    })
                
            } else {
                console.log('NO userReview')
                res.redirect(`/user/${req.user._id}/profile`)
            }

        })

}