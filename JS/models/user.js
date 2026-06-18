class user {
    constructor(id, name, displayName, password, address, phoneNum, imageUrl) {
        this.id = id
        this.name = name
        this.displayName = displayName
        this.password = password
        this.address = address
        this.phoneNum = phoneNum
        this.imageUrl = imageUrl
    }
}

// global array to store all user instances
let usersList = []

// create a new user and add them to the list if they don't already exist
const createUser = (name, displayName, password, address, phoneNum, imageUrl) => {
    // check if a user with the exact same details already exists
    if(checkIfUserExist(name, password, address, phoneNum)) {
        return null
    }
    const id = idGenerator()
    // pass displayName and imageUrl to the constructor
    const newUser = new user(id, name, displayName, password, address, phoneNum, imageUrl)
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

const updateUser = (id, updatedFields) => {
    const index = usersList.findIndex(user => user.id === id);
    if (index === -1) {
        return null;
    }

    // Dynamic update: update fields only if they are provided in the request body
    if (updatedFields.name !== undefined) usersList[index].name = updatedFields.name;
    if (updatedFields.displayName !== undefined) usersList[index].displayName = updatedFields.displayName; // Added displayName update
    if (updatedFields.password !== undefined) usersList[index].password = updatedFields.password;
    if (updatedFields.address !== undefined) usersList[index].address = updatedFields.address;
    if (updatedFields.phoneNum !== undefined) usersList[index].phoneNum = updatedFields.phoneNum;
    if (updatedFields.imageUrl !== undefined) usersList[index].imageUrl = updatedFields.imageUrl;

    return usersList[index];
};

module.exports = {
    createUser,
    getUserById,
    getUserByCredentials,
    getAllUsers,
    checkIfUserExist,
    updateUser
}