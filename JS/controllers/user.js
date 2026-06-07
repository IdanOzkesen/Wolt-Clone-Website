const userModel = require('../models/user.js')
const {createSocket} = require('../middlewares/middlewares.js')

// create a new user, the request body must contain name, password, address, phoneNum, and payment
const createUser = async (req, res) => {
    const {name, password, address, phoneNum} = req.body
    // check if all required fields are present
    if(!name || !password || !address || !phoneNum) {
        res.status(400).json({error: "Missing required fields: name, password, address, or phoneNum"})
        return
    }
    // create a new user by calling the createUser function in the user model
    const newUser = userModel.createUser(name, password, address, phoneNum)
    if (newUser === null) {
        res.status(404).json({ error: "User already exists" })
        return
    }
    let command = 'post'
    const id = newUser.id
    const otherIds = [1]
    // create a socket connection or emit an event for the user creation
    let status = await createSocket (command, id, otherIds)
    // if the socket creation fails, return a 404 error
    if (!status) {
        res.status(404).json({error: "Failed to create socket connection"})
        return
    }
    command = 'delete'
    // create a socket connection or emit an event for the user creation
    status = await createSocket (command, id, otherIds)
    // if the socket creation fails, return a 404 error
    if (!status) {
        res.status(404).json({error: "Failed to create socket connection"})
        return
    }
    res.status(201).json(newUser)
}

// get a specific user by their ID, provided in the request parameters
const getUserById = (req, res) => {
    const id = req.params.userid
    if(!id) {
        res.status(400).json({error: "Missing required parameter: userId"})
        return
    }

    // get the user details by calling getUserById function in the user model
    const user = userModel.getUserById(id)

    // if the user is not found, return a 404 error
    if(user == null) {
        res.status(404).json({ error: "User not found" })
        return
    }
    res.json(user)
}

module.exports = {
    createUser,
    getUserById
}