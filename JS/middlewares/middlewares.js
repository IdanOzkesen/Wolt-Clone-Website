const userModel = require('../models/user.js')
const productAndRestaurantModel = require('../models/productAndRestaurant.js')
const orderModel = require('../models/order.js')
const net = require('net')

// middleware to check if a user exists by their ID provided in request parameters
const checkUserExistence = (req, res, next) => {
    const userid = req.params.userid || req.get('userId');
    
    // check if user ID is present
    if(!userid) {
        res.status(400).json({error: "Missing required parameter: userId"})
        return
    }
    // fetch the user by calling getUserById in the user model
    const user = userModel.getUserById(userid)
    // if user does not exist, return a 404 error
    if(user == null) {
        res.status(404).json({ error: "User not found" })
        return
    }
    // proceed to the next middleware or route handler
    next()
}

// middleware to check if a restaurant exists by its ID provided in request parameters
const checkRestaurantExistence = async (req, res, next) => {
    const restaurantId = req.params.restaurantId || req.params.id;
    // check if restaurant ID is present
    if(!restaurantId) {
        res.status(404).json({error: "Missing required parameter: restaurantId"})
        return
    }
    // fetch the restaurant by calling getRestaurantById in the productAndRestaurant model
    const restaurant = await productAndRestaurantModel.getRestaurantById(restaurantId)
    // if restaurant does not exist, return a 404 error
    if(restaurant == null) {
        res.status(404).json({ error: "Restaurant not found" })
        return
    }
    // proceed to the next middleware or route handler
    next()
}

// middleware to check if a product and its associated restaurant exist
const checkProductExistence = async (req, res, next) => {
    const restaurantId = req.params.restaurantId
    const productId = req.params.productId

    // check if both restaurant ID and product ID are present
    if(!productId || !restaurantId) {
        res.status(404).json({error: "Missing required parameters: restaurantId or productId"})
        return
    }
    
    // verify restaurant existence directly to ensure data integrity
    const restaurant = await productAndRestaurantModel.getRestaurantById(restaurantId)
    if(restaurant == null) {
        res.status(404).json({ error: "Restaurant not found" })
        return
    }
    
    // fetch the product by calling getProductById in the productAndRestaurant model
    const product = await productAndRestaurantModel.getProductById(restaurantId, productId)
    // if product does not exist, return a 404 error
    if(product == null) {
        res.status(404).json({ error: "Product not found in this restaurant" })
        return
    }
    // proceed to the next middleware or route handler
    next()
}

// middleware to check if an order exists by its ID provided in request parameters
const checkOrderExistence = async (req, res, next) => {
    const orderId = req.params.orderId || req.params.id;
    // check if order ID is present
    if(!orderId) {
        res.status(404).json({error: "Missing required parameter: orderId"})
        return
    }
    // fetch the order by calling getOrderById in the order model
    const order = await orderModel.getOrderById(orderId)
    // if order does not exist, return a 404 error
    if(order == null) {
        res.status(404).json({ error: "Order not found" })
        return
    }
    // proceed to the next middleware or route handler
    next()
}

// helper function to open a TCP socket, send a command string, and resolve based on server response status
function createSocket (command, id, otherIds) {
    return new Promise((resolve, reject) => {
        // initialize a new TCP socket client
        const client = new net.Socket()
        // format the message to be sent to the server
        const messageFromUser = `${command} ${id} ${otherIds.join(' ')}`.trim();
        const tcpHost = process.env.TCP_HOST || '127.0.0.1';

        // connect to the TCP server
        client.connect(8080, tcpHost, function() {
            // write the message followed by a newline character
            client.write(messageFromUser + '\n')
        })
        
        
        // handle incoming data from the TCP server
        client.on('data', function(data) {
            console.log('Received: ' + data)
            const serverResponse = data.toString()
            // split the server response into lines to parse the status
            const lines = serverResponse.split('\n')
            const serverStatus = lines[0].trim();
            // destroy the socket connection after receiving the response
            client.destroy()

            // resolve the promise with false if server returns 400 or 404, otherwise true
            if(serverStatus.includes('400') || serverStatus.includes('404')) {
                resolve(false)
            } else {
                resolve(true)
            }
        })

        // handle socket closure
        client.on('close', function() {
        })

        // handle socket errors and resolve with false to prevent crashes
        client.on('error', function(err) {
            resolve(false)
        })
    })
}

module.exports = {
    checkUserExistence,
    checkRestaurantExistence,
    checkProductExistence,
    checkOrderExistence,
    createSocket
}