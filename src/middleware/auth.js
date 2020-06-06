const jwt = require('jsonwebtoken')
const User = require('../models/user')

const AuthRole = (Role) => {
    return async (req, res, next)=>{
        try{
    
            const token = req.header('Authorization').replace('Bearer ','')
            const encoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const user = await User.findOne({ _id: encoded._id, 'tokens.token': token })
    
            if(!user){
                throw new Error('User Not Found!')
            }
            if(Role != user.role && 'ADMIN'!=user.role){
                res.status(403).send()
            }
 
            req.token = token
            req.user  = user
            next()
    
        } catch(error){
                res.status(401).send({ error: 'User Did Not Authenticate!'})
        }
    }
    
}


module.exports = AuthRole