const mongoose = require('mongoose')

const Schema = mongoose.Schema


const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicUrl: {
        type: String,
        required: false
    },
    numOfBooksRead: {
        type: Number,
        required: false
    },
    reviews: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, {
    timestamps: true
})


module.exports = mongoose.model('User', userSchema)