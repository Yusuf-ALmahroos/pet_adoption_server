const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { plugin } = require('../models/User');
require('dotenv').config()

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const APP_SECRET = process.env.APP_SECRET;

// hash passwoed
const hashPassword = async (password) => {
    let hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash
};

// compare Password
const comparePassword = async (password, storedPassword) => {
    let passwordPass = await bcrypt.compare(password, storedPassword);
    return passwordPass
};

// create Token
const createToken = (payload) => {
    let token = jwt.sign(payload, APP_SECRET, {expiresIn: '7d'});
    return token
};

// strip Token
const stripToken = (req, res, next) => {
    try {
       const authHeader = req.headers['authorization'];

       if (authHeader && authHeader.startsWith('Bearer ')){
        const token = authHeader.split(' ')[1];
        res.locals.token = token;
        return next();
       }
        res.status(401).send({ status: 'Error', msg: 'Unauthorized'});
    } catch (error) {
        console.log(error);
        res.status(401).send({ status: 'Error', msg: 'Strip Token Err!'});
        
    }
};

// verify Token
const verifyToken = (req, res, next) => {
    const {token} = res.locals;

    try {
        let payload = jwt.verify(token, APP_SECRET)

        if (payload) {
            res.locals.payload = payload
            return next()
        }
        res.status(401).send({ status: 'Error', msg: 'Unauthorized'});
    } catch (error) {
        console.log(error);
        res.status(401).send({ status: 'Error', msg: 'Verify Token Err!'});
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    createToken,
    stripToken,
    verifyToken
};