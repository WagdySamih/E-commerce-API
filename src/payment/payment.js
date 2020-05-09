const express = require('express')
const router = express.Router()

const paypal = require('paypal-rest-sdk')

const AuthRole = require('../middleware/auth')
const Cart = require('../models/cart')

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret' : process.env.CLIENT_SECRET
});





router.get('/create',AuthRole('USER'), async function(req, res){

    const cart = await Cart.findById(req.user.cart)
    await cart.populate('products.product').execPopulate()
    await cart.populate('owner').execPopulate()

    console.log(cart)


    /**     create a payment request file with all order data   */
    let payReq = {
        'intent':'sale',
        'redirect_urls':{
            'return_url':`http://${process.env.host}/process`,
            'cancel_url':`http://${process.env.host}/cancel`
        },
        'payer':{
            'payment_method':'paypal'
        },
        'transactions':[{
            "item_list":{
                "items":[]
            },
            'amount':{
                'total':cart.totalPrice,
                'currency':'USD'
            },
            'description':'This is the payment transaction description.'
        }]
    }

    /**     adding cart data to the payment form     */
    cart.products.forEach( function(product){
        const item = {
            name: product.product.name,
            price: product.product.price,
            currency: "USD",
      //      sku: "001",
            quantity: product.quantity
        }
        payReq.transactions[0].item_list.items.push(item)
    })

    payReq = JSON.stringify(payReq)




    /**    build PayPal payment request */
    paypal.payment.create(payReq, function(error, payment){

        console.log(payment)
        if(error){
            console.error(error.response.details);
        } else {
            //capture HATEOAS links
            var links = {};
            payment.links.forEach(function(linkObj){
                links[linkObj.rel] = {
                    'href': linkObj.href,
                    'method': linkObj.method
                };
            })
        
            //if redirect url present, redirect user
            if (links.hasOwnProperty('approval_url')){
                res.redirect(links['approval_url'].href);
            } else {
                console.error('no redirect URI present');
            }
        }
    });
});




router.get('/process', function(req, res){
    /**     
    *      this router is called after the user is submitting the form
    *      to check whether the process is success or failed
    */
    var paymentId = req.query.paymentId;
    var payerId = { 'payer_id': req.query.PayerID };
    /**    this function to excute the payment process after submitting the form */
    paypal.payment.execute(paymentId, payerId, function(error, payment){
        console.log(payment)
        if(error){
            console.error(error);
        } else if (payment.state == 'approved'){ 
                res.send('payment completed successfully');
        } else {
            res.send('payment failed');
        }
        
    });
    console.log('after submitting the form')
});

router.get('/cancel', function(req, res){  
    /**
    *      this router is called when the user cancel the paypal payment form
    */
    res.send('payment is canceled')
});


module.exports = router