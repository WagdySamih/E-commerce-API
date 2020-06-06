const express = require('express')
const router = new express.Router()
 
const User = require('../models/user')
const AuthRole = require('../middleware/auth')

const { sendWelcomeEmail } = require('../emails/account')


console.log(process.env.MONGODB_URL)

router.post("/user/sign-up", async (req, res) => {
    /**
     *      a router to create new user with the following requirements
     *          name - email - password - phone number - adress
     *          set up admin role if AdminCode field is provided with correct ADMIN_SECRET_KEY
     * 
                {
                    user:{ name:"",  email:"",  password:"",  phoneNumber:,  adress:"" }
                    AdminCode:""
                }    
     */
    const user = new User(req.body.user)
    if(req.body.AdminCode===process.env.ADMIN_SECRET_KEY){
        user.role='ADMIN'
    } 
    try{
        //sendWelcomeEmail(user.name, user.email)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    }catch(error){
        res.status(500).send(error)
    }
})


router.post("/user/login", async (req, res) => {
    /**
     *      router for an exsting user login
     *      {email:"",  password:""}
     */
    
    try{

        const user = await User.findByCredntials(req.body.email, req.body.password)
        if(!user){
            return res.status(404).send({error:'user not found'})
        }
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(error){
        res.status(500).send(error.message)
    }
})


router.post("/user/logout", AuthRole('USER'), async (req, res) => {
    /**
     *      router for an authenticated user to logout from a single device
     */
    const user = req.user
    try{
        user.tokens = user.tokens.filter((tokens) =>  tokens.token  !== req.token)
        await user.save()
        res.send(user)
    }catch(error){
        res.status(500).send(error)
    }
})


router.post("/user/logout-all", AuthRole('USER'), async (req, res) => {
    /**
     *      router for an authenticated user to logout from a all devices
     */
    try{
        req.user.tokens = []
        await req.user.save()
        res.send(req.user)
    }catch(error){
        res.status(500).send(error)
    }
})


router.get("/user/me", AuthRole('USER') ,async (req, res) => {
    /**
     *      router for an authenticated user to get thier profile
     */
    res.send(req.user)
})


router.patch("/user/me",  AuthRole('USER'), async (req, res) => {
    /**
     *      router for an authenticated user to edit thier profile
     */
    const allAllowedUpdates = ['name','email','password','phoneNumber','adress' ]
    const updates = Object.keys(req.body)
    const isAllowedUpdate = updates.every((update) => allAllowedUpdates.includes(update) )

    if(!isAllowedUpdate){
        return res.status(400).send({error:'Not a valid update'})
    }
 
    try{
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update] )
        await user.save()
        res.send(user)
    } catch (error){
        res.status(500).send({error:'server error!'})
    }
})

module.exports = router