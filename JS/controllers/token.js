const userModel = require('../models/user.js')


// get user ID by credentials, the request body should contain name and password
const getUserByCredentials = (req, res) => {
    // Extract the name and password from the request body
    const { name, password } = req.body;
    // Check if both name and password are provided
    if (!name || !password) {
        res.status(400).json({ error: "Missing required fields: name or password" });
        return;
    }
    // Use the user model to get the user by their credentials
    const user = userModel.getUserByCredentials(name, password);

    // if the user is not found with the provided credentials, return 404 error
    if (!user) {
        res.status(404).json({ error: "Invalid username or password" }); 
        return;
    }

    res.json({ id: user.id });
}

module.exports = {
    getUserByCredentials
}