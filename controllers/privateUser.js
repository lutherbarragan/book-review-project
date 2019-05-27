const User = require('../models/User')


exports.getProfile = (req, res, next) => {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect('/login')
            }
            let isOwnUserProfile = false
            // console.log(user.createdAt)
            let createdAt = user.createdAt.toString().split('').map((c, i) => {
                if(i <= 14 && i > 3) {
                    return c
                }
            }).join('')

            if(user._id.toString() === req.user._id.toString()) { 
                isOwnUserProfile = true
            }

            res.render('private/profile', {
                pageTitle:`${user.username}'s Profile`, 
                username: user.username,
                email: user.email,
                memberSince: createdAt,
                booksRead: 0,
                isUserProfile: isOwnUserProfile,
                url: req.url
            })

        })
        .catch(err => {
            console.log('No user found', err)
            res.redirect('/login')
        })

}

exports.getEditProfile = (req, res, next) => {
    const userId = req.params.userId;
    console.log('USERID EDIT: ', userId)

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect('/login')
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
                    url: req.url
                })
            } else {
                console.log()
                res.redirect(req.profileUrl)
            }

        })
        .catch(err => console.log('GET EDIT ERROR', err))

}