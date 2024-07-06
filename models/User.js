const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is a required field"]
    },
    email: {
        type: String,
        required: [true, "email is a required field"]
    },
    password: {
        type: String,
        required: [true, "password is a required field"],
        select: false
    }
}, {timestamps: true})

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;