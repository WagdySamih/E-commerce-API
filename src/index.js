const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const productRouter = require('./routers/products')
const productImagesRouter = require('./routers/productImages')
const cartRouter = require('./routers/cart')
const orderRouter = require('./routers/order')
const reviewRouter = require('./routers/review')

const app = express()
app.use(express.json())


app.use(userRouter)
app.use(productImagesRouter)
app.use(productRouter)
app.use(cartRouter)
app.use(orderRouter)
app.use(reviewRouter)


const port = process.env.PORT
app.listen(port, () => {
    console.log('The Server Is running On Port', port)
})