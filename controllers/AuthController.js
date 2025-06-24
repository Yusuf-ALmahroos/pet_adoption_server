const {User} = require ('../models');
const middleware = require ('../middleware')

const Register = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        
        let passwordDigest =await middleware.hashPassword(password);

        let existEmail = await User.findOne({email});

        if (existEmail) {
            return res.status(400).send('The email already registere!!')
        } else {
            const user = await User.create({name, email, passwordDigest});
            res.status(200).send(user);
        }
    } catch (error) {
        throw error;
        
    }
};

const Login = async (req, res) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne({email});
        let matched = await middleware.comparePassword(
            password,
            user.passwordDigest
        )

        if (matched) {
            let payload = {
                id: user.id,
                email: user.email
            }
            let token = middleware.createToken(payload)
            return res.status(200).send({user:payload, token})
        } else {
            res.status(401).send({status: 'Error', msg: 'Unauthorized'})
        }
    } catch (error) {
        console.error(error);
        res.status(401).send({status: 'Error', msg: 'Err can not log in!!'});
        
    }
};

const UpdatePassword =async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;
        let user = await User.findOne(req.params.user_id);
        let matched = await middleware.comparePassword(
            oldPassword,
            user.passwordDigest
        )

        if (matched) {
            let passwordDigest = await middleware.hashPassword(newPassword);
            user = await User.findByIdAndUpdate(req.params.user_id, {passwordDigest})
            let payload = { 
                id: user.id,
                email: user.email
            }
            return res.status(200).send({status: 'Password Update', user: payload});

        } else {
            return res.status(401).send({status: 'Error', msg: 'Err password did not match!'})
        }
    } catch (error) {
        console.error(error);
        return res.status(401).send({status: 'Error', msg: 'Err can not update password!'})
    }
};

const CheckSession = async (req,res) => {
    const { payload} = res.locals;
    res.status(200).send(payload);
};



module.exports = {
    Register,
    Login,
    UpdatePassword,
    CheckSession
};