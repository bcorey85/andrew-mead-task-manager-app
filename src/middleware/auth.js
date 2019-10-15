const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') // Remove Bearer portion of string, returns just token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // Verifies token, returns ObjectID and iat ('issued at' timestamp)

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }) // Find user by ID from token and specific token in array

        if (!user) {
            throw new Error()
        } 

        req.token = token // Add token to request object
        req.user = user // Add user to request object

        next() // Passes control to next middleware function in stack
    } catch (e) {
        res.status(401).send({error: 'Please authenticate.'})
    }
}

module.exports = auth