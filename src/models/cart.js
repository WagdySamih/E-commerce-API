const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref :'User'
    },
    products:[{
        product:{        
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity:{
            type: Number,
            min: 1
        }  
    }],
    totalPrice:{
        type: Number,
        default: 0
    }
})
cartSchema.pre('save',async function getTotalPrice(next){
    const cart = this
    let totalPrice = 0
    await cart.populate({path:'products.product', select:'price'}).execPopulate()
    cart.products.forEach((product) => {
        totalPrice+=product.product.price * product.quantity
    })
    cart.totalPrice = totalPrice
    next()
})


const Cart = mongoose.model('Cart',cartSchema)
module.exports = Cart
