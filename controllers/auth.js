const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { TryCatch } = require('../middlewares/error');

const userModel = require("../models/User");

const login = TryCatch(async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({
            status: 401,
            success: false,
            message: "Make sure you have entered correct Email Id and Password"
        })
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (passwordMatched) {
        const access_token = await jwt.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            iat: Math.floor(Date.now() / 1000) - 30
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Logged in successfully",
            access_token: access_token,
            id: user._id,
            email: user.email,
            name: user.name,
        })
    }

    return res.status(401).json({
        status: 401,
        success: false,
        message: "Make sure you have entered correct Email Id and Password"
    })
})

const register = TryCatch(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        return res.status(409).json({
            status: 409,
            success: false,
            message: "A user with this email id already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await userModel.create({ name, email, password: hashedPassword });

    return res.status(200).json({
        status: 200,
        success: true,
        message: "User registered successfully"
    })
})

const checkIsLoggedIn = TryCatch(async (req, res) => {
    let access_token = req?.headers?.authorization;
    access_token = access_token.substring(7,); // Remove Bearer from the authorization header

    const verified = await jwt.verify(access_token, process.env.JWT_SECRET);
    const currTimeInMilliSeconds = Math.floor(Date.now() / 1000);

    // access_token is not expired
    if (verified && verified.iat < currTimeInMilliSeconds && verified.exp > currTimeInMilliSeconds) {
        const newToken = await jwt.sign({
            name: verified.name,
            email: verified.email,
            id: verified.id,
            iat: Math.floor(Date.now() / 1000) - 30
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Logged in successfully",
            access_token: newToken,
            name: verified.name,
            email: verified.email,
            id: verified.id
        })
    }

    return res.status(401).json({
        status: 401,
        success: false,
        message: "Session expired"
    })

})

const isAuthenticated = async (req, res, next) => {
    let access_token = req?.headers?.authorization;
    access_token = access_token.substring(7,);

    try {
        const verified = await jwt.verify(access_token, process.env.JWT_SECRET);

        req.user = {
            id: verified.id,
            email: verified.email,
            name: verified.name
        }

        next();
    }
    catch (err) {
        return res.status(401).json({
            status: 401,
            success: false,
            message: "Session expired"
        })
    }
}

module.exports = { login, register, checkIsLoggedIn, isAuthenticated };