const express = require('express')
const multer = require('multer')
const Product = require('../models/products')

const router = new express.Router()

const AuthRole = require('../middleware/auth')

const upload = multer({
    /**
     *      maximum file size is 2 MB
     *      these images extensions is only allowed  [jpg - jpeg - png - PNG - gif]
     */
    limits:{
        fileSize: 2*1024*1024
        },fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png|PNG|gif)$/) ){
            return callback(new Error('Please upload images only'))
        }
        callback (undefined, true)
    }
})


router.post('/admin/product/:productId/images', AuthRole('ADMIN') ,upload.array('photos', 5), async (req, res)=>{
    /**
     *      Admin Role
     *          this router for Admin to add multiple images for a specific product with 5 images Maximum
     */

    const product = await Product.findById(req.params.productId)
    if(!product){
        res.status(404).send({error:'Product not found'})
    }
    if(product.images.length + req.files.length >5 ){
        res.status(400).send({error:'You Can not add more than 5 images per product'})
    }

    req.files.forEach((image) =>{
        product.images.push(image.buffer)
    })
    await product.save()
    res.send()
    
},(error, req, res, next)=>{                             /// this function is made to handle the middleware unhandled errors (multer!)
     res.status(400).send({ error: error.message })
})



router.delete('/admin/product/:productId/images/:imageInde', AuthRole('ADMIN'), async (req, res)=>{
    /**    
     *      Admin Role
     *          delete single image for a product by product id and image array index
     */
    try{
        const product = await Product.findById(req.params.productId)
        if(!product || !product.images[req.params.imageIndex]){
            res.status(404).send({error:'Page not found'})
        }

        const removedImage = product.images[req.params.imageIndex]
        product.images.splice(req.params.imageIndex,1)
        await product.save()

        res.set('Content-Type','image/jpeg')
        res.send( removedImage)
    } catch (error){
        res.status(500).send('error mn hna ya 7iwan')
    }
})



router.delete('/admin/product/:productId/images', AuthRole('ADMIN'), async (req, res)=>{
    /**
     *      Admin Role
     *           delete all images for specific product
     */
    try{
        const product = await Product.findById(req.params.productId)
        if(!product){
            res.status(404).send({error:'Product not found'})
        }
        product.images=[]
        await product.save()
        res.send()
    } catch (error){
        res.status(500).send()
    }
})




router.get('/product/:productId/images/:imageIndex', async(req, res)=>{
    /**
     *      display an image for a specific product by its array index
     */

    const productId = req.params.productId
    const imageIndex = req.params.imageIndex
    try{
        const product = await Product.findById(productId)
        if(!product || !product.images[imageIndex]){
            res.status(404).send({error:'Page not found'})
        }

        const image = product.images[imageIndex]
        res.set('Content-Type','image/jpg')
        res.send(image)
    } catch(error) {
        res.status(500).send()
    }
})


module.exports  = router