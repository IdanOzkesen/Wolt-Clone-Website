const userModel = require('../models/user.js')
const {createSocket} = require('../middlewares/middlewares.js')
const { generateTokens } = require('./token.js');

// create a new user, the request body must contain name, displayName, password, address, phoneNum, and payment
const createUser = async (req, res) => {
    // Extract user details including displayName and imageUrl from the request body
    const { name, displayName, password, address, phoneNum, imageUrl } = req.body;

    // check if all required fields are present (added displayName as required)
    if (!name || !displayName || !password || !address || !phoneNum) {
        res.status(400).json({ error: "Missing required fields: name, displayName, password, address, or phoneNum" });
        return;
    }

    const hasNmber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    if (password.length < 8 || !hasUpperCase || !hasSpecialChar || !hasNmber) {
        res.status(400).json({ error: "Password must:\nbe at least 8 characters long\ncontain at least one uppercase letter\ninclude at least one special character\ncontain at least one number" });
        return;
    }

    // create a new user by calling the createUser function in the user model, passing displayName and imageUrl
    const newUser = userModel.createUser(name, displayName, password, address, phoneNum, imageUrl);
    
    if (newUser === null) {
        res.status(404).json({ error: "User already exists" });
        return;
    }

    let command = 'post';
    const id = newUser.id;
    const otherIds = [1];

    // create a socket connection or emit an event for the user creation
    let status = await createSocket(command, id, otherIds);
    // if the socket creation fails, return a 404 error
    if (!status) {
        res.status(404).json({ error: "Failed to create socket connection" });
        return;
    }

    // Creating the delete socket event as requested
    command = 'delete';
    status = await createSocket(command, id, otherIds);
    // if the socket creation fails, return a 404 error
    if (!status) {
        res.status(404).json({ error: "Failed to create socket connection" });
        return;
    }

    const tokens = generateTokens(newUser.id);
    
    // Final response sent once after all operations are complete
    res.status(201).json({ 
        user: newUser, 
        accessToken: tokens.accessToken, 
        refreshToken: tokens.refreshToken 
    });
};

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

// Update an existing user's details by their ID
const updateUser = async (req, res) => {
    const id = req.params.userid;
    if (!id) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
    }

    // Security Check: Only the user with the matching ID can edit their own profile.
    if (req.user && req.user.userId !== id) {
        res.status(404).json({ error: "Forbidden: You are only allowed to edit your own profile data" });
        return;
    }

    const { name, displayName, password, address, phoneNum, imageUrl } = req.body;

    // Password strength validation (only if the user is trying to change their password)
    if (password) {
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        if (password.length < 8 || !hasUpperCase || !hasSpecialChar || !hasNumber) {
            res.status(400).json({ error: "Password must:\nbe at least 8 characters long\ncontain at least one uppercase letter\ninclude at least one special character\ncontain at least one number" });
            return;
        }
    }

    // Call model to apply updates, including displayName
    const updatedUser = userModel.updateUser(id, { name, displayName, password, address, phoneNum, imageUrl });

    if (updatedUser === null) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    res.json(updatedUser);
};

module.exports = {
    createUser,
    getUserById,
    updateUser
}