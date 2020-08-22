const express = require('express')
const chalk = require('chalk')
const http = require('http')
const path = require('path')
const hbs = require('hbs')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

//For Chat App
const User = require('./models/user')
const Chat = require('./models/chat')

const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./public/utils/messages')
const { generateLocationMessage } = require('./public/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, noOfUsers } = require('./public/utils/users')

const userRouter = require('./routers/user')
const coordinateRouter = require('./routers/coordinate')
const chatRouter = require('./routers/chat')

require('./db/mongoose')


const app = express()
const port = process.env.PORT

//For Browser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const publicDirectoryPath = path.join(__dirname, '/public')
const viewsPath = path.join(__dirname, '/templates/views')
const partialsPath = path.join(__dirname, '/templates/partials')

//For Postman
app.use(express.json())

app.use(cookieParser())
app.use(userRouter)
app.use(coordinateRouter)
app.use(chatRouter)
app.use(express.static(publicDirectoryPath))

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//For Socket.io

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    // console.log('New WebSocket connection')

    // For Setting up room
    socket.on('join', async ({ username, room }, callback) => {
        
        try {
            const isValidRoom = await User.findOne({roomNo: room})
            if(!isValidRoom){
                return callback('Invalid Room Number!')
            }
            else{
                // username is of initiator
                //Adding User
                const { error, user } = addUser({ id: socket.id, username, room})
    
                if(error){
                    return callback(error)
                }
    
                socket.join(room)
    
                // Emitting Welcome!
                // socket.emit('message', generateMessage('Team Wanderer', 'Welcome!'))
    
                // New User Alert to all others except joined user
                socket.broadcast.to(user.room).emit('message', generateMessage('Team Wanderer', `${user.username} has joined!`))
                
                callback()            
            }
        }
        catch(e) {
            console.log(e)
        }
    })

    // For Normal Message
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not Allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        
        // Saving Chat to database
        let chatMessage = new Chat({
            message : message,
            sender : user.username
        })
        
        // chatMessage.save().then(()=> {
        //     console.log("Saved Chat Successfully")
        // })
        
        callback()
    })

    //For Location Message
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        
        // Saving Chat to database
        // let chatMessage = new Chat({
        //     message : `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        //     sender : user.username
        // })
                
        // chatMessage.save().then(()=> {
        //     console.log("Saved Chat Successfully")
        // })
                
        
        callback()
    })

    // User Disconnection User
    socket.on('disconnect', () => {
        // Removing User
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Team Wanderer', `${user.username} has left`))
        }
    })
})

// Ignition
server.listen(port, () => {
    console.log(chalk.magenta('Server is up on port #' + port))
})