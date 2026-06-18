class user {
    constructor(id, name, password, address, phoneNum, imageUrl) {
        this.id = id
        this.name = name
        this.password = password
        this.address = address
        this.phoneNum = phoneNum
        this.imageUrl = imageUrl // Added imageUrl property
    }
}

// global array to store all user instances
let usersList = []

// create a new user and add them to the list if they don't already exist
const createUser = (name, password, address, phoneNum, imageUrl) => {
    // check if a user with the exact same details already exists
    if(checkIfUserExist(name, password, address, phoneNum)) {
        return null
    }
    const id = idGenerator()
    // pass imageUrl to the constructor
    const newUser = new user(id, name, password, address, phoneNum, imageUrl)
    usersList.push(newUser)
    return newUser
}

// retrieve a specific user instance by their ID
const getUserById = (id) => {
    const index = usersList.findIndex(user => user.id === id)
    // if user is not found, return null
    if (index == -1) {
        return null
    }
    return usersList[index]
}

// retrieve a user by their name and password credentials
const getUserByCredentials = (name, password) => {
    const index = usersList.findIndex(user => user.name === name && user.password === password)
    // if no user matches the credentials, return null
    if (index == -1) {
        return null
    }
    return usersList[index]
}

// retrieve the entire list of users
const getAllUsers = () => {
    return usersList
}

function idGenerator() {
    return Math.floor(Math.random() * 1000000000).toString(); 
}

// helper function to check if a user already exists with the exact same details
const checkIfUserExist = (name, password, address, phoneNum) => {
    return usersList.findIndex(user => user.name == name && user.password == password 
        && user.address == address && user.phoneNum == phoneNum) != -1
}

module.exports = {
    createUser,
    getUserById,
    getUserByCredentials,
    getAllUsers,
    checkIfUserExist
}