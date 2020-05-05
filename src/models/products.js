const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    title:{
        type:String,
        trim: true,
        required:true
    },
    description:{
        type: String,
        trim: true,
        required: true
    },
    price:{
        type:Number,
        required:true
    },
    images: [{
        type: Buffer,
        required: false  
    }],
    inStock:{
        type: String,
        enum:['Yes','Limited','No'],
        default:'Yes'
    }
}, {
    timestamps: true
})
productSchema.methods.toJSON = function () {
    const porduct = this
    const porductObejct = porduct.toObject()
    delete porductObejct.images
    return porductObejct
}

const Porduct = mongoose.model('Product',productSchema)
module.exports = Porduct