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
/// calculate average rating per product
reviewSchema.statics.CalcAverageRating = async function (productId){
    try{
        const reviews = await this.model('Review').find({ product: productId })
        let sum = 0;
       
        reviews.forEach( (review) => sum += review.stars )
        const averageRating =  (sum / (reviews.length))
        
        await this.model('Product').findByIdAndUpdate(productId, { averageRating },{
            new: true
        })
    } catch(error) { 
        console.log(error)
    }
}

reviewSchema.post('save', async function(next){
 
    await this.constructor.CalcAverageRating(this.product)
})

reviewSchema.post('remove', async function(next){
    await this.constructor.CalcAverageRating(this.product)
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review