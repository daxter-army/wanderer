const express = require('express')
const chalk  = require('chalk')
const auth = require('../middleware/auth')
const router = new express.Router()

// Loading functions
const get_coords_from_db = require('../functions/values')
const final_results = require('../functions/results')
var search_friends = require('../functions/friends')

const User = require('../models/user')
const Coordinate = require('../models/coordinate')

router.get('/myLocation', auth, (req, res)=>{

    var noRequest = true

    if(req.user.engagedWith){
        noRequest = false
    }

    res.render('create-location', {
        name: req.user.name,
        userName: req.user.userName,
        email: req.user.email,
        age: req.user.age,
        engagedWith: req.user.engagedWith,
        roomNo: req.user.roomNo,
        id: req.user._id,
        noRequest: noRequest
    })
})

router.post('/myLocation', auth, async (req, res) => {
    console.log(chalk.cyan("POST : /create-location"))
    // console.log(chalk.green("User's Location"))
    // console.log(chalk.greenBright(req.body.lat, req.body.lon))

    const coordinate = new Coordinate({
        ...req.body,
        owner: req.user._id
    })

    try {
        await coordinate.save()
        res.status(201).send(coordinate)
    } catch (e) {
        res.status(400).send(e.message)
        console.log(chalk.red(e.message))
    }
})

//Show all locations
router.get('/show-locations', auth, async (req, res) => {
    // console.log(chalk.cyan('GET=> /all-location'))
    try {
        const location = await Coordinate.find()
        // await req.user.populate('coordinates').execPopulate()
        // res.send(req.user.coordinates)
        res.send(location)
    } catch (e) {
        res.status(500).send()
    }
})

// Find nearby
router.post('/find-nearby', auth, async (req, res) => {
    // console.log(chalk.cyan("POST : /find-nearby"))

    try {
        // Fetch coordinates of current active User
        await req.user.populate('coordinates').execPopulate()
        
        const lat_from = req.user.coordinates[0].lat
        const lon_from = req.user.coordinates[0].lon

        const find = await Coordinate.find()

        console.log(lat_from.value, lon_from.value)
        
        if(!(find || lat_from || lon_from))
            console.log(chalk.red("Database is Empty"))

        const coords = get_coords_from_db(find)
        // console.log(coords)

        // <<-- Result from results.js -->>
        var found_nearby = final_results(lat_from, lon_from, coords)

        if(found_nearby.distance.length==0){
            res.send("you do not have any people around you, registered with us at this moment")
        }
        
        // Got 3 Arrays having distance,coordinates,boolean of shortlisted people
        // res.send(found_nearby)
        var final_friends = search_friends(found_nearby)
        
        //Got Coordinates of People within Range
        // res.send(final_friends)
        const people_around_u = []

        for(var i=0 ; i < final_friends.length ; i++){
            function getTuple(){
                return final_friends[i]
            }
            var [lattitude, longitude] = getTuple()

            const coordinates = await Coordinate.findOne({lat: lattitude, lon: longitude})
            const users = await User.findOne({ _id: coordinates.owner })
            // console.log(users)
            people_around_u.push(users.userName)
            // console.log((chalk.blue("People around you : ")) + (chalk.yellow(users.userName)))
        }
        // console.log(people_around_u)
        res.render('find-nearby',{
            name: req.user.name,
            userName: req.user.userName,
            email: req.user.email,
            age: req.user.age,
            engagedWith: req.user.engagedWith,
            roomNo: req.user.roomNo,
            id: req.user._id,
            peopleAroundU: people_around_u
        })
    }
    catch(e){
        res.status(500).send(e)
        console.log(chalk.red(e))
    }
})

// Show location
router.get('/show-location/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const coordinate = await Coordinate.findOne({ _id, owner: req.user._id })

        if (!coordinate) {
            return res.status(404).send()
        }

        res.send(coordinate)
    } catch (e) {
        res.status(500).send()
    }
})

// Update location
router.patch('/update-location/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['lat', 'lon']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const coordinate = await Coordinate.findOne({ _id: req.params.id, owner: req.user._id })

        if (!coordinate) {
            return res.status(404).send()
        }

        updates.forEach((update) => coordinate[update] = req.body[update])
        await coordinate.save()
        res.send(coordinate)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete locations
router.delete('/delete-location/:id', auth, async (req, res) => {
    try {
        const coordinate = await Coordinate.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!coordinate) {
            res.status(404).send()
        }

        res.send(coordinate)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router