const mongoose = require('mongoose')
const Double = require('@mongoosejs/double')

const coordinateSchema = new mongoose.Schema({
    lat: {
        type: Double,
        required: true,
        trim: true,
        required: true
    },
    lon: {
        type: Double,
        required: true,
        trim: true,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    collection: 'positions'
})

const Coordinate = mongoose.model('Coordinate', coordinateSchema)
module.exports = Coordinate