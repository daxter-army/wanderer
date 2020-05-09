const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Coordinate = require('./coordinate')

const userSchema = new mongoose.Schema({
    userName: {
        type : String,
        trim: true,
        required: true,
        lowercase: true,
        // unique: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        required: true,
        validate(value){
            if (value < 13 ){
                throw new Error('You must be atleast 13 years old to register.')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    revealInfo: {
        type: Boolean,
        default: false
    },
    engagedWith: {
        type: String,
        default: undefined
    },
    roomNo: {
        type: Number,
        default : undefined
    },
    timestamp: {
        type: Date,
        default: Date.now,
        timezone: 'Asia/Calcutta'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

// Relationship between User and it's location
userSchema.virtual('coordinates', {
    ref: 'Coordinate',
    localField: '_id',
    foreignField: 'owner'
})

// Deletes specific properties in response
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.age
    delete userObject.avatar
    delete userObject.tokens

    return userObject
}

// Generate Authorization Token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'mehulsinghteya')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// Find Login Credentials
userSchema.statics.findByCredentials = async (userName, password) => {
    const user = await User.findOne({ userName })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user coordinates when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Coordinate.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User