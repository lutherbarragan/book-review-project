const User = require('../models/User')
const Review = require('../models/Review')


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
                    username: user.username,
                    email: user.email,
                    memberSince: createdAt,
                    booksRead: 0,
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
                let createdAt = user.createdAt.toString().split('').map((c, i) => {
                    if(i <= 14 && i > 3) {
                        return c
                    }
                }).join('')
                
                res.render('private/profile-edit', {
                    pageTitle:`${user.username}'s Profile`, 
                    pageRoute: '/profile',
                    username: user.username,
                    email: user.email,
                    memberSince: createdAt,
                    booksRead: user.numOfBooksRead,
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
    const userId = req.params.userId;
    const newUsername = req.body.username;
    const newEmail = req.body.email.toLowerCase();
    const inputErrors = []

        
    User.findById(userId)
    .then(user => {
        if(!user) {
            res.redirect(`/user/${req.user._id}/profile/edit`) //No user found
        }
        if(user._id.toString() !== req.user._id.toString()) {//Diferent user
            res.redirect(`/user/${req.user._id}/profile/edit`)
        }

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

        if(newUsername.trim() !== "" && newEmail.trim() !== "") {   // if the input values are NOT emty strings
            user.username = newUsername;
            user.email = newEmail;
            user.save();
            res.redirect(`/user/${req.user._id}/profile`)
        
        } else {
            let createdAt = user.createdAt.toString().split('').map((c, i) => {
                if(i <= 14 && i > 3) {
                    return c
                }
            }).join('')
            
            res.render('private/profile-edit', {
                pageTitle:`${user.username}'s Profile`,
                pageRoute: '/profile',
                username: newUsername,
                email: newEmail,
                memberSince: createdAt,
                booksRead: user.numOfBooksRead,
                url: req.url,
                inputErrors: inputErrors
            })

        }
       
    })
    .catch(err => console.log(err))
        // res.redirect(`/user/${req.user._id}/profile/edit`)    
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