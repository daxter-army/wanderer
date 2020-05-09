// For Socket Connection
const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Send Message
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt : moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Send Location
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Reading QueryString
const { initiator, receiver, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Reading & Setting Values in HTML File
const rec = document.querySelector('#receiver')
rec.innerHTML = receiver
const roomNo = document.querySelector('#room-no')
roomNo.innerHTML = room

// Activating Message Submission
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
           return console.log(error)
        }
        
        console.log('Message delivered!')
    })
})

// Fetching Location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

// Sending Info of QueryString to server for setting up Room
// Only sending Initiator
const username = initiator
socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href='http://localhost:3000/dashboard-user'
    }
})

//Fetching from Chats
var people = {
    one: initiator,
    two: receiver
}

// Sending to server Fetch API
const url = 'http://localhost:3000/retrieve-chat'
var request = new Request(url, {
    method: "POST",
    body: (JSON.stringify(people)),
    headers: new Headers({
        'Content-Type': 'application/json'
    })
})

fetch(request)
.then((response) => response.json())
.then((data) => {
    console.log(data)

    if(data[0].message.includes("maps/?q=")){
        for(var i = 0 ; i < data.length ; i++){

        }
    }
    else{

    }


    if(data[0].message.includes("maps/?q=")){
        for(var i = 0 ; i < data.length ; i++){
            const html = Mustache.render(locationMessageTemplate, {
                username: data[i].sender,
                url: data[i].message,
                createdAt: moment(data[i].timestamp).format('hh:mm a')
            })
            $messages.insertAdjacentHTML('beforeend', html)
        }
    }
    else{
        for(var i = 0 ; i < data.length ; i++){
            const html = Mustache.render(messageTemplate, {
                username: data[i].sender,
                message: data[i].message,
                createdAt : moment(data[i].timestamp).format('hh:mm a')
            })
            $messages.insertAdjacentHTML('beforeend', html)
        }
    }
    autoScroll()
})