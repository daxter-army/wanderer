const express = require('express')
// const path = require('path')
const chalk = require('chalk')
const auth = require('../middleware/auth')
const router = new express.Router()
var roomAllocator = require('../functions/roomAllocator')

require('../db/mongoose')

const User = require('../models/user')
const Chat = require('../models/chat')

router.get('/begin-chat/:userName', auth, async (req, res) => {
    console.log(chalk.cyan("GET : /begin-chat"))

    const initiator = req.user.userName
    const receiver = req.params.userName

    try{

        const check = await User.findOne({ userName: initiator})
        console.log(chalk.blue(initiator + " already engaged with " + check.engagedWith))
    
        if(receiver==check.engagedWith){
            return res.redirect(`http://localhost:3000/chat-user?initiator=${initiator}&receiver=${receiver}&room=${check.roomNo}`)
        }

        var room = roomAllocator(100,999)

        await User.findOneAndUpdate({ userName: initiator },{ engagedWith: receiver, roomNo: room })
        await User.findOneAndUpdate({ userName: receiver },{ engagedWith: initiator, roomNo: room })
        
        console.log({
            'initiator': initiator,
            'receiver': receiver,
            'room' : room
        })

        res.redirect(`/chat-user?initiator=${initiator}&receiver=${receiver}&room=${room}`)
    }
    catch(e){
        res.send(500).send(e)
    }
})

router.get('/chat-user', auth, (req,res) => {
    console.log(chalk.cyan("GET : /chat-user"))
    res.sendFile('D:\\wanderer_0.2_mutating\\src\\public\\chat.html')
})

router.post('/retrieve-chat',async (req, res) => {
    console.log(chalk.yellow("POST : /retrieve-chat"))

    const one = req.body.one
    const two = req.body.two

    if(!(one && two)){
        console.log("No data Received from Client side")
    }

    try {
        const chats = await Chat.find()
        res.status(200).json(chats)
    }
    catch(e) {
        res.status(500).send('Error while retrieving chats.')
    }
})


module.exports = router