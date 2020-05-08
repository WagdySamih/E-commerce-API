const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')


const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 4
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error('It Is Not A Valid E-mail')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        maxlength: 100
    },
    phoneNumber: {
        type: Number,
        required: false,
        minlength: 10,
    },
    adress: {
        type: String,
        required: true
    },
    role:{
        type: String,
        default:'USER',
        enum:['USER', 'ADMIN']
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId(),
        ref:'Cart'
    },
    wishList:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})
UserSchema.virtual('orders',{
    ref:'Order',
    localField:'_id',
    foreignField:'owner'
})


UserSchema.methods.toJSON = function () {
    const user = this
    const userObejct = user.toObject()

    delete userObejct.tokens
    delete userObejct.password
    delete userObejct.cart

    return userObejct
}


UserSchema.statics.findByCredntials = async (email, password) => {

    const user = await User.findOne({ email })
    if (!user)
        throw new Error('Wrong e-mail adress')

    const isMatch = bcrypt.compare(user.password, password)
    if (!isMatch)
        throw new Error('Wrong Password')

    return user
}


UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY)
    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token
}


UserSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


const User = mongoose.model('User', UserSchema)
module.exports = User