const express = require('express')
const router = express.Router()


const Review = require('../models/review')
const Product = require('../models/products')
const AuthRole = require('../middleware/auth')

/**
 *      User Role:
 *          User Can add comment and rating                 done
 *          User can get his review for a specific product  done                   
 *          User Can edit his comment and rating            
 *          user can delete his Review                      done
 *      anyone:
 *          user can get all reviews for specific product
 * 
 */

 router.post('/review/:productId', AuthRole('USER'), async(req, res)=>{
     /**
      *     router to add a review by an authenticated user to a spicific product
      *       PS: User can add only one review to a single product
      */
    const owner = req.user._id
    const product = req.params.productId
    const review = new Review({
        owner,
        product,
        ...req.body
    })
     try{
        const product = await Product.findById(product)
        if(!product){
            res.status(404).send()
        }
        const haveOldReview = await Review.findOne({product , owner}) 
        if(haveOldReview){
            res.status(400).send({error:'You already reviewed this product!'})
        }

        await review.save()
        res.status(201).send(review)
     } catch(error){
        res.status(500).send()
     }
 })

 router.get('/review/:productId', AuthRole('USER'), async(req, res)=>{
     /**
      *     router to get the authenticated user review for specific product 
      */
     const owner = req.user._id
     const product = req.params.productId
     try{
        const review =  await Review.findOne({owner, product})
        if(!review){
            res.status(404).send()
        }
        res.send(review)
     }catch(error){
        res.status(500).send()
     }
 })

 router.delete('/review/:productId', AuthRole('USER'), async(req, res)=>{
     /**
      *     router to delete the user review for a specific product 
      */
    const owner = req.user._id
    const product = req.params.productId
    try{
       const review =  await Review.findOneAndDelete({owner, product})
       if(!review){
           res.status(404).send()
       }
       res.send(review)
    }catch(error){
       res.status(500).send()
    }
})

router.patch('/review/:productId', AuthRole('USER'), async(req, res)=>{
     /**
      *     router to edit the user review for a specific product  (comment & stars fiels)
      */

    const allowedUpdates = ['stars','comment']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update)=> allowedUpdates.includes(update) )
    if(!isValid){
        res.status(400).send({error:'Not Valid Update'})
    }

    const owner = req.user._id
    const product = req.params.productId
    try{
        const review = await Review.findOne({ owner, product })
        if(!review){
            res.status(404).send({error:'Page not found'})
        }

        updates.forEach((update)=> review[update] = req.body[update]) 
        await review.save()
        res.send(review)
    }catch(error){
        res.status(500).send({error})
    }
})

module.exports = router