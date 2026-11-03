const User = require("../models/userModel");
const {ValidateReqData} = require('../validators/authValidator');
const Bcrypt = require('bcrypt');
const isProduction = process.env.NODE_ENV === "production";

const login = async (req,res)=> {
    try{
        const {email, password} = req.body;
        // console.log(email, password)
        const user = await User.getUserByEmailId(email);
        if(!user){
            throw new Error("invalid Credential");
        }

         const isCorrectPass = await User.velidateUserPassword(email, password);
        if(!isCorrectPass){
            throw new Error("invalid credential");
        }

        //Generate JWT token
        const user_id = user.id;
        const token = await User.getJWT(user_id);

                res.cookie('TOKEN', token, {
            httpOnly: true,
            secure: isProduction,                     // HTTPS only in prod
            sameSite: isProduction ? "none" : "lax", // cross-site only in prod
            expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // cookie will be removed after 8 hours
        });

        res.send({data : user, isLoggedIn: true});
    } catch (err) {
        //console.log("error while login ",err);
        res.status(500).json({
            status: 500,
            message: err.message
        });
    }
}

const signup = async(req,res)=>{
    try{
        const {password, email,name} = req.body;
        ValidateReqData(req.body);

                //encrypt the data
        const hashPassword = await Bcrypt.hash(password , 10);
        const user = await User.createUser(
            name,
            email,
            hashPassword
        );

        //Generate JWT token
        const user_id = user.id;
        const token = await User.getJWT(user_id);

        
        res.cookie('TOKEN', token, {
            httpOnly: true,
            secure: isProduction,                     // HTTPS only in prod
            sameSite: isProduction ? "none" : "lax", // cross-site only in prod
            expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // cookie will be removed after 8 hours
        });
        res.send({
            message : "User added successfully",
            data : user,
            isLoggedIn: true
        });


    } catch (err) {
        //console.log("error while login ",err);
        let msg = "Failed to signup!"
        if(err.code == 23505){
            msg = "Already user exist";
        }
        res.status(500).json({
            status: 500,
            msg
        });
    }
}

const logout = async (req, res) => {
        res.cookie('TOKEN', null, {
            maxAge: 0 // cookie will be removed after 8 hours
        });

        res.send({data : "logOut successfully !", isLoggedIn: false});
}

module.exports = {
signup,
login, logout
};