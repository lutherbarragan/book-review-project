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
            
            // console.log(user.createdAt)
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
                    username: user.username,
                    email: user.email,
                    memberSince: createdAt,
                    booksRead: 0,
                    reviews: userReviews,
                    isUserProfile: isOwnUserProfile,
                    url: req.url
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
        .catch(err => console.log('GET EDIT ERROR', err))
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