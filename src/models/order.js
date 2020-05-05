const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
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
    },
    status:{
        type: String,
        enum: ['Sent', 'Received', 'Pending Shipment', 'Shipped', 'Delivered'],
    }
},{
    timestamps: true
})

const Order = mongoose.model('Order',orderSchema)
module.exports = Order
