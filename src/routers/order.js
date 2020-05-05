const express = require('express')
const Order = require('../models/order')

const router = express.Router()

const AuthRole = require('../middleware/auth')

const {sendOrderUpdatedStatusEmail} = require('../emails/account')

/*
 *  ADMIN ROLE
 *      admin can see all orders  
 *      admin can see specific cart by id
 *      admin can edit odrer status with enum status <<'Sent', 'Received', 'Pending Shipment', 'Shipped', 'Delivered'>>
 *  USER ROLE
 *      user can fetch his order to see updated status 
 */


router.get('/admin/order',AuthRole('ADMIN') ,async(req, res)=>{
    /**
     *        Admin Can get all orders with each product and the customer details
     * 
     *        this router has a filter by order status it can be povided like this..   
     *          /admin/order?status=Sent
     *                       status could be ['Sent', 'Received', 'Pending Shipment', 'Shipped', 'Delivered']
     *        Pagination 
     *          /admin/order?limit=x&skip=y 
     *        Sorting
     *          /admin/order?sortBy=createdAt:asc or  /admin/order?sortBy=createdAt:desc
     * 
     */
    
    const filter = {}
    const sort = {}
    /**        filter due to status code  */
    if(req.query.status){
        filter.status = req.query.status
    }
    /**        pagination with skip and limit  */
    if(req.query.skip || req.query.limit){
        filter.skip=parseInt(req.query.skip)
        filter.limit=parseInt(req.query.limit)
    }
    /**        sorting with createdAt asc and desc order  */
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]]= (parts[1]==='asc')? 1 : -1
    }
    try{
        /**  if not of the find method argument not provided nothing can happen!   */
        const orders = await Order.find(filter.status)
                                  .skip(filter.skip)
                                  .limit(filter.limit)
                                  .sort(sort)

        for(let i=0 ; i<orders.length; i++){
            await orders[i].populate({path:'owner',select: ['name','email','phoneNumber','adress']}).execPopulate()
            await orders[i].populate({path:'products.product',select:['title','price']}).execPopulate()
        }
        res.send(orders)
    } catch (error){
        res.status(500).send()
    }
 })

 router.get('/admin/order/:orderId', AuthRole('ADMIN'), async(req, res)=>{
    /**
     *      Admin Can get an order by its id
     */
    try{
        const order = await Order.findById(req.params.orderId)
        if(!order){
            return res.status(404).send({error:'Page not fount'})
        }
        await order.populate('owner').execPopulate()
        await order.populate({path:'products.product',select:['title','price']}).execPopulate()
        res.send(order)
    } catch(error){
        res.status(500).send()
    }
})

 router.patch('/admin/order/:orderId', AuthRole('ADMIN'), async(req, res)=>{
    /**
     *      Admin Can edit the order status 
     *      the customer is notified by email about his order status
     */
    try{
        const order = await Order.findById(req.params.orderId)
        if(!order){
            return res.status(404).send({error:'Page not fount'})
        }
        const update = Object.keys(req.body)[0]
        if(update!=='status'){
             return res.status(400).send({error:'A Not Valid Update!'})
        }
        order.status = req.body.status
        

        await order.save()
        await order.populate({path:'owner',select: ['name','email','phoneNumber','adress']}).execPopulate()
        await order.populate({path:'products.product',select:['title','price']}).execPopulate()

        //console.log(order.owner.name, order.owner.email, order.status)
        res.send(order)
    } catch (error){
        res.status(500).send({error:error.message})
    }
 })



 router.get('/order/me', AuthRole('USER'), async(req, res)=>{
    /**
     *      the authenticated user can get his order details 
     */
    try {
        await req.user.populate('orders').execPopulate()
        res.send(req.user.orders[0])
    } catch (error) {
        res.status(500).send('here')
    }
 })





 module.exports = router