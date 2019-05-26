const User = require('../models/User')


exports.getProfile = (req, res, next) => {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.redirect('/login')
            }

            if(user._id.toString() === req.user._id.toString()) { 
                res.render('private/profile', {
                    pageTitle:`${user.username}'s Profile`, 
                    username: `${user.username} - ID: ${userId}`,
                    isUserProfile: true
                })
            } else {
                res.render('private/profile', {
                    pageTitle:`${user.username}'s Profile`, 
                    username: `${user.username} - ID: ${userId}`,
                    isUserProfile: false
                })
            }

        })
        .catch(err => {
            console.log('No user found', err)
            res.redirect('/login')
        })

}