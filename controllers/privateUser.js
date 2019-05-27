const User = require('../models/User')


exports.getProfile = (req, res, next) => {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect('/login')
            }
            let isOwnUserProfile = false

            if(user._id.toString() === req.user._id.toString()) { 
                isOwnUserProfile = true
            }

            res.render('private/profile', {
                pageTitle:`${user.username}'s Profile`, 
                username: user.username,
                email: user.email,
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