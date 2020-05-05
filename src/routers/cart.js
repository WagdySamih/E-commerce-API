const mongoose = require('mongoose')
const experss = require('express')
const router = experss.Router()

const Cart = require('../models/cart')
const Product = require('../models/products')
const Order = require('../models/order')


const AuthRole = require('../middleware/auth')




router.post('/cart/:productId/:quantity', AuthRole('USER'), async (req, res)=>{
        /*
         *      if cart not exsit make one
         *      if product not found send error
         *      if product exsit in cart increase its quantity
         *      else push to cart 
         */
        const owner = req.user._id
        const _id = req.user.cart

        const productId = req.params.productId
        const quantity = req.params.quantity
    try{
        let cart = await Cart.findById(_id)

        if( !cart ) {  
            cart = new Cart({
                _id,
                owner,
                products:[] 
            })
        }
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).send('Product not found')
        }


        const exist = cart.products.find((product)=> {
            if (product.product == productId){
                product.quantity +=  parseInt(quantity)
            } 
            return  product.product == productId
        })

        if(!exist){
            cart.products.push({
                product: productId,
                quantity
            })  
        }

        await cart.save()
        res.send(cart)
    } catch (error) {
        res.status(500).send({error})
    }
})

router.get('/cart', AuthRole('USER'), async(req, res)=>{
    /**
     *      get all the user cart content 
     */
    try{
        const cart = await Cart.findById(req.user.cart)
        if(!cart){
            return res.status(404).send({error:'Page not found'})
        }
        await cart.populate({path:'products.product', select:['title','description','price']}).execPopulate()
        res.send(cart)
    } catch(error) {
        res.status(500).send()
    }
})

router.patch('/cart/:productId/:quantity', AuthRole('USER'), async (req, res)=>{
        /*
         *      check if cart & product exist, and product exist in cart
         *      update product quantity
         *      update total cost
         */
    try{
        const updatedQuantity = req.params.quantity
        const cart = await Cart.findById(req.user.cart)
        if(!cart ){
            return res.status(404).send({error:'Cart not found'})
        }
 
        const exist = cart.products.some((product) => {
            if(product.product == req.params.productId){
                product.quantity  = updatedQuantity
            }  
            return product.product == req.params.productId     
        })
    
        if(!exist ){
            return res.status(404).send({error:'Product not found in Cart'})
        }

        await cart.populate({path:'products.product', select:['title','description','price']}).execPopulate()
        await cart.save()
        res.send(cart)
    } catch (error) {
        res.status(500).send({error})
    }
})


router.delete('/cart/empty', AuthRole('USER'), async(req, res)=>{
    /**
     *      delete the cart content 
     */
    try {
        const cart = await Cart.findByIdAndDelete(req.user.cart)
        if(!cart){
            return res.status(404).send({error:'Page not found'})       
        }
        res.send(cart)
    } catch(error) {
        res.status(500).send({error:'server error'})
    }
})

router.delete('/cart/:productId', AuthRole('USER'), async(req, res)=>{
    /**
     *      delete a specific product from cart
     *          - check if cart and product exist
     *          - delete the product and update the total price 
     */
    try {
        let cart = await Cart.findById(req.user.cart)
        const product = await Product.findById(req.params.productId)
        if(!cart || !product ){
            return res.status(404).send({error:'Page not found'})       
        }

        cart.products = cart.products.filter((product) => product.product != req.params.productId)
        await cart.save()
        await cart.populate({path:'products.product', select:['title','description','price']}).execPopulate()
        res.send(cart)
    } catch(error) {
        res.status(500).send({error:'server error'})
    }
})


router.post('/cart/checkout', AuthRole('USER'), async(req, res)=>{
    /**
     *      save cart in order collection, so as it be available to admin to see & edit status
     *      send email to user to track order 
     */
    try {
        let cart = await Cart.findByIdAndDelete(req.user.cart)
        if(!cart){
            return res.status(404).send({error:'Cart not found'})       
        }

        const _id = mongoose.Types.ObjectId()
        const order = new Order({
            _id,
            ...cart.toObject(),
            status:'Sent'
        })

        await order.save()
        await order.populate({path:'owner',select: ['name','email','phoneNumber','adress']}).execPopulate()
        await order.populate({path:'products.product',select:['title','description','price']}).execPopulate()
        res.send(order)
    } catch(error) {
        res.status(500).send({error:'server error'})
    }
})

module.exports = router