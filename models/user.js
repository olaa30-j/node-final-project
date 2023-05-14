const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    userName: {
        type: String,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    }, 
    {
    strict: false,
    versionKey: false})

const user = mongoose.model('users', userSchema)

module.exports = user;