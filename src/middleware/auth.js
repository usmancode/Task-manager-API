const user = require('../models/user')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const valid_user = await user.findOne({
            _id: decoded._id,
            'tokens.token': token

        })

        if (!valid_user) {
            throw new Error()
        }
      
        req.token=token
        req.valid_user = valid_user

        next()

    } catch (e) {
        res.status(401).send({
            Error: "Please authenticate"
        })
    }
}

module.exports = auth