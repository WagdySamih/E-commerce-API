const express = require('express')
const Product = require('../models/products')
const Review = require('../models/review')

const router = new express.Router()

const AuthRole = require('../middleware/auth')


router.post("/admin/product", AuthRole('ADMIN') , async (req, res) => {
    /**
     *      Admin Role
     *          a router for admin to add new product with field  ['title','description','price','inStock']
     */
    const product = new Product(req.body)
    try {
        await product.save()
        res.send(product)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.get("/product/:productId", AuthRole('ADMIN'), async (req, res) => {
    /**
     *       Admin Role
     *            a router to read a single product by its id
     */
    try {
        const product = await Product.findById(req.params.productId)
        res.send(product)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.get("/product", async (req, res) => {
    /**
     *      a router to read all products
     *           can add search - pagination - sort by price - sort by created date
     * 
     *    Pagination 
     *      /product?skip=x&limit=y
     *    SortBy
     *      /product/sortBy=price:asc       or    /product/sortBy=price:desc
     *      /product/sortBy=createdAt:asc   or    /product/sortBy=createdAt:asc
     */
    const filter = {}
    const sort = {}
    if(req.query.limit || req.query.skip){
        filter.limit = parseInt(req.query.limit)
        filter.skip = parseInt(req.query.skip)
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1]==='asc')? 1 : -1
    }

    try {
        const products = await Product.find()
                                      .skip(filter.skip)
                                      .limit(filter.limit)
                                      .sort(sort)
        res.send(products)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.patch("/admin/product/:productId", AuthRole('ADMIN'), async (req, res) => {
    /**
     *       Admin Role
     *           edit a specific product with any of its allowed fiels only
     *           title - description - price - inStock ('YES,'NO','LIMITED')
     */
    const allowedUpdates = ['title','description','price','inStock']
    const updates = Object.keys(req.body)
    const isAllowedUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isAllowedUpdate)
        return res.status(400).send({error:'Not a valid update'})
    
    try {
        const _id = req.params.productId
        const product =await Product.findById(_id)
        if(!product){
            return res.status(404).send({error:'product not found'})
        }
        updates.forEach((update) => product[update] = req.body[update] )
        await product.save()
        res.send(product)

    } catch (error) {
        res.status(500).send()
    }
})


router.delete("/admin/product/:productId", AuthRole('ADMIN'), async(req, res) => {
    /**
     *       Admin Role
     *           delete a single product by id
     */
    const _id = req.params.productId
    try {
        const product = await Product.findByIdAndDelete(_id)
        if(!product){
            res.status(404).send({error:'Product Not Found'})
        }
        res.send(product)
    } catch (error){
        res.status(500).send(error)
    }
})


router.get('/product/:productId/reviews',async(req, res)=>{
    /**
     *      router to get all reveiws for a speocifc product 
     */
    const _id = req.params.productId
    try{
        const product = await Product.findById(_id)
        if(!product){
            res.status(404).send()
        }
        const reviews = await Review.find({product:_id})
        res.send(reviews)
    } catch (error){
        res.status(500).send()
    }    
})


module.exports = router