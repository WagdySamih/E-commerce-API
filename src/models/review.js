const mongoose = require('mongoose')


/**
 *      must set virtual relation to product->> to  get it's reviews
 */
const reviewSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review