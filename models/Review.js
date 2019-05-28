const mongoose = require('mongoose')
const Schema = mongoose.Schema


const reviewSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})



module.exports = mongoose.model('Review', reviewSchema)