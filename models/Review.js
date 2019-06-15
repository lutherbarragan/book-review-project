const mongoose = require('mongoose')
const Schema = mongoose.Schema


const reviewSchema = new Schema({
    bookId: {
        type: Number,
        required: true
    },
    bookTitle: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Array,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})



module.exports = mongoose.model('Review', reviewSchema)