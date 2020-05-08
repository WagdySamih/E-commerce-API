const express = require('express')
const router = express.Router()

const Product = require('../models/products')
const AuthRole = require('../middleware/auth')


router.get('/wishlist', AuthRole('USER'), async(req, res)=>{
    /**
     *      get all products in the user wishlist
     */
    try{
        await req.user.populate('wishList').execPopulate()
        res.send(req.user)
    }catch(error){
        res.status(500).send(error)
    }
})


router.post('/wishlist/:productId', AuthRole('USER'), async(req, res)=>{
    /**
     *      add product to the user wish list after checking 
     *      if product exist in products and not existed in user wish list aleady
     */
    try{
        const product = await Product.findById(req.params.productId)
        if(!product){
            res.status(404).send({error:'product not found'})
        }
        // const exist = req.user.wishList.some((product) => product === productId)
        // if(exist){
        //     res.status(400).send({erorr:'product is already in your wish list'})
        // }

        req.user.wishList.push(req.params.productId)
        await req.user.save()
        await req.user.populate('wishList').execPopulate()
        res.send(req.user)
    }catch(error){
        res.status(500).send(error)
    }
})


router.delete('/wishlist/:productId', AuthRole('USER'), async(req, res)=>{
    /**
     *      check if product is found in products & the user wish list
     *      then remove it from the wish list
     */
    try{
        const product = await Product.findById(req.params.productId)
        if(!product){
            res.status(404).send({error:'product not found'})
        }
        
        let found = false
        req.user.wishList = req.user.wishList.filter((product)=>{
            if( product===req.params.productId)
                 found = true
            return  product!==req.params.productId
        })
        
        if(!found){
            res.status(404).send({error:'product not found'}) 
        }
        
        await req.user.populate('wishList').execPopulate()
        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send()
    }
})

module.exports = router