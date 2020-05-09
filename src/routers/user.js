const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const chalk = require('chalk')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create yourselves
router.get('/create-user', async(req, res) => {
    console.log(chalk.yellow("GET : /create-user"))

    res.render('create-user')
})

router.post('/create-user', async (req, res) => {
    console.log(chalk.cyan("POST : /create-user"))

    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        // res.status(201).send({user, token})
        res.redirect('login-user')
    }
    catch(e){
        res.status(400).send(e)
    }
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// Login
router.get('/login-user', (req, res) => {
    console.log(chalk.yellow("GET : /login-user"))

    res.render('login-user')
})

router.post('/login-user', async (req, res) => {
    console.log(chalk.cyan("POST : /login-user"))

    try{
        const user = await User.findByCredentials(req.body.userName, req.body.password)
        const token = await user.generateAuthToken()

        res.cookie('auth_token', token)

        // console.log(chalk.green({user, token}))
        res.redirect('/dashboard-user')
    }
    catch(e) {
        console.log('bad')
        res.status(400).send(e.message)
    }
})

// Dashboard
router.get('/dashboard-user', auth, (req, res) => {
    console.log(chalk.yellow("GET : /dashboard-user"))

    res.render("dashboard-user",{
        name: req.user.name,
        userName: req.user.userName,
        email: req.user.email,
        age: req.user.age,
        engagedWith: req.user.engagedWith,
        roomNo: req.user.roomNo
    })
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// Update myself
router.patch('/myself-user', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// See myself
router.get('/myself-user' , auth, async (req, res) => {
    res.send(req.user)
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// Logout
router.post('/logout-user', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        // res.send()
        res.redirect('/login-user')
    }
    catch(e) {
        res.status(500).send(e.message)
    }
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// Logout from all logged in devices
router.post('/logoutAll-user', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        // res.send()
        res.redirect('/login-user')
    } catch(e) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// Delete active user
router.delete('/myself-user', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    }
    catch(e) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

// Upload profile avatar
const upload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image...!!!'))
        }

        cb(undefined, true)
    }
})
router.post('/myself-avatar', auth, upload.single('avatar'),async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error ,req, res, next) => {
    res.status(400).send({error : error.message})
})

// Delete profile avatar
router.delete('/myself-avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Display avatar
router.get('/myself-avatar/:id', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        // Setting header for image type
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }
    catch(e) {
        res.status(404).send()
    }
})

// 404
// router.get('*',(req,res) => {
//     res.status(404).send('<h1>404</h1>')
// })

module.exports = router