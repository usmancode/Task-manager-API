const express = require('express')

const user = require('../models/user')

const sharp=require('sharp')

const router = new express.Router()

const auth = require('../middleware/auth')

const multer = require('multer')

const {sendWelcomeMail,sendDeleteMail}=require('../emails/account')


router.post('/users', async (req, res) => {

    const newuser = new user(req.body)
    try {

        await newuser.save()
        sendWelcomeMail(newuser.name,newuser.email)
        const token = await newuser.generateAuthToken()
        res.status(201).send({
            newuser,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }

})


router.post('/users/login', async (req, res) => {
    try {


        const login_user = await user.findByCredentials(req.body.email, req.body.password)
        const token = await login_user.generateAuthToken()

        if (!login_user) {
            res.status(400).send("unable to login")
        }
        res.send({
            login_user,
            token
        })
    } catch (e) {

        res.status(400).send()
    }

})


router.post('/users/logout', auth, async (req, res) => {
    try {
        const tokens_otherthan_to_logout = req.valid_user.tokens.filter((token) => {
            return !(req.token === token.token)
        })
        req.valid_user.tokens = tokens_otherthan_to_logout
        await req.valid_user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

router.post('/users/logoutall', auth, async (req, res) => {
    try {

        req.valid_user.tokens = []

        req.valid_user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})



router.get('/users/me', auth, async (req, res) => {

    res.send(req.valid_user)

})





router.patch('/users/update', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const validupdate = ['name', 'age', 'email', 'password']
    const isValidUpdate = updates.every((update) => validupdate.includes(update))

    if (!isValidUpdate) {
        return res.status(404).send({
            error: "invalid updates"
        })
    }

    try {

        updates.forEach((update) => req.valid_user[update] = req.body[update])

        await req.valid_user.save()
        //**above two line written for bypassing the user model (hasing the password before saving work for both when we create a new user and when we update user password) */
        //    const update_user = await user.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        res.send(req.valid_user)

    } catch (e) {
        res.status(400).send()
    }

})


router.delete('/users/me', auth, async (req, res) => {
    try {

        req.valid_user.remove()
         sendDeleteMail(req.valid_user.name,req.valid_user.email)
        res.send(req.valid_user)
    } catch (e) {
        res.status(500).send()
    }
})





const uploads = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match('\.jpg|\.jpeg|\.png$')) {
            return cb(new Error("Please upload  .jpg , .jpeg , .png extension files only"))
        }

        cb(undefined, true)

    }
})


router.post('/users/me/avatar', auth, uploads.single('avatar'), async (req, res) => {

    const buffer=await sharp(req.file.buffer).resize({width:250,height:350}).png().toBuffer()

    req.valid_user.avatar = buffer

    await req.valid_user.save()

    res.send("file uploaded perfectly")

}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        if (!req.valid_user.avatar) {
            return res.status(400).send({
                error: "Avatar not exist"
            })
        }
        req.valid_user.avatar = undefined
        await req.valid_user.save()
        res.send()

    } catch (e) {
        res.status(500).send("errorr in deleting")
    }
})





router.get('/users/:id/avatar', async (req, res) => {
    try {

        const user_avatar = await user.findById(req.params.id)

        res.set({
            'Content-Type': 'image/jpg'
        })
        res.send(user_avatar.avatar)


    } catch (e) {
        res.status(400).send("erorr in getting avatar")
    }
})


module.exports = router