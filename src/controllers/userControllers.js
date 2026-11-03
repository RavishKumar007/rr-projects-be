const User = require("../models/userModel");

const getUsers = async (req, res) => {

    try {

        const users = await User.getAllUsers();

        res.status(200).json({
            status: 200,
            data: users
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 500,
            message: "Failed to fetch users"
        });

    }
};


const getUser = async (req, res) => {

    try {

        const id = req.params.id;

        const user = await User.getUserById(id);

        if(!user){
            throw new Error("invalid Credential");
        }

        res.status(200).json({
            status: 200,
            data: user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 500,
            message: "Failed to fetch user"
        });

    }
};


const createUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;
        //console.log("password ", password)

        const user = await User.createUser(
            name,
            email,
            password
        );

        res.status(201).json({
            status: 201,
            data: user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 500,
            message: "Failed to create user"
        });

    }
};

const getUserDetail = async(req, res) => {
    try {
        const userDetails = req.user;
        if(!userDetails){
            throw Error("User Details Not Found !");
        }
        res.send({
            data : userDetails
        });

    } catch (err) {
        res.status(500).send({
            message : err.message
        })
    }
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    getUserDetail
};