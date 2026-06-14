const jwt = require('jsonwebtoken');
const userModel = require('../models/user.js');

const ACCESS_SECRET = "super_secret_access_key_111";
const REFRESH_SECRET = "super_secret_refresh_key_222";

let activeRefreshTokens = [];


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
    // If the user is found, generate an access token and a refresh token
    const userId = user.id
    const accessToken = jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '30d' });
    activeRefreshTokens.push(refreshToken);
    // Return the access token, refresh token and userId in the response
    res.json({ accessToken, refreshToken, userId });
}

const refreshTokenHandler = (req, res) => {
    const { Refresh_Token } = req.body;
    // Check if the refresh token is provided in the request body 
    // and if it is valid (exists in the activeRefreshTokens array)
    if (!Refresh_Token) {
        return res.status(401).json({ error: "Refresh Token required" });
    } 
    if (!activeRefreshTokens.includes(Refresh_Token)) {
        return res.status(403).json({ error: "Invalid Refresh Token" });
    }
    // Verify the refresh token using the REFRESH_SECRET
    jwt.verify(Refresh_Token, REFRESH_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token expired or altered" });
        }

        const newAccessToken = jwt.sign({ id: decoded.id }, ACCESS_SECRET, { expiresIn: '15m' });
        
        res.json({ accessToken: newAccessToken });
    });
}

const logoutHandler = (req, res) => {
    const { Refresh_Token } = req.body;
    // Check if the refresh token is provided in the request body 
    // and if it is valid (exists in the activeRefreshTokens array)
    if (!Refresh_Token || !activeRefreshTokens.includes(Refresh_Token)) {
        return res.status(400).json({ error: "Refresh Token required or Refresh Token invalid" });
    }
    // Remove the refresh token from the activeRefreshTokens array to invalidate it
    activeRefreshTokens = activeRefreshTokens.filter(token => token !== Refresh_Token);
    res.json({ message: "Logged out successfully" });
}

module.exports = { getUserByCredentials, refreshTokenHandler, ACCESS_SECRET, logoutHandler };