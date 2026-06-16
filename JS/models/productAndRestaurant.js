class restaurant {
    constructor(id, name, address, category, phoneNum, ownerId, imageUrl) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.category = category;
        this.phoneNum = phoneNum;
        this.ownerId = ownerId;
        this.imageUrl = imageUrl;
        this.productsList = [];
    }
}

class product {
    constructor(id, name, description, category, price, imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;     // New field to store the product image URL
    }
}

// global array to store all restaurant instances
let restaurantsList = [];

// helper function to find a restaurant's index in the list by its ID
const findRestaurantById = (id) => {
    return (restaurantsList.findIndex(restaurant => restaurant.id === id));
}

// helper function to find a product's index inside a specific restaurant by their IDs
const findProductByRId = (restaurantId, id) => {
    const restaurantIndex = findRestaurantById(restaurantId);
    // if restaurant is not found, return -1
    if (restaurantIndex === -1) {
        return -1;
    }
    return (restaurantsList[restaurantIndex].productsList.findIndex(product =>
        product.id === id));
}

// create a new restaurant and add it to the list if it doesn't already exist
const createRestaurant = (name, address, category, phoneNum, ownerId, imageUrl) => {
    // check if a restaurant with the exact same details already exists
    if (checkIfRestaurantExist(name, address, category, phoneNum, ownerId, imageUrl)) {
        return null;
    }
    const id = idGenerator();
    const newRestaurant = new restaurant(id, name, address, category, phoneNum, ownerId, imageUrl);
    restaurantsList.push(newRestaurant);
    return newRestaurant;
}

// retrieve the entire list of restaurants
const getAllRestaurants = () => {
    return (restaurantsList);
}

// retrieve a specific restaurant instance by its ID
const getRestaurantById = (id) => {
    return (restaurantsList[findRestaurantById(id)]);
}

// retrieve all restaurants belonging to a specific owner
const getRestaurantsByOwner = (ownerId) => {
    return restaurantsList.filter(restaurant => restaurant.ownerId === ownerId);
}

// search for restaurants and products matching a specific text query
const searchEntities = (query) => {
    const lowerQuery = query.toLowerCase();
    const results = { restaurants: [], products: [] };

    restaurantsList.forEach(restaurant => {
        if (restaurant.name.toLowerCase().includes(lowerQuery) ||
            (restaurant.category && restaurant.category.toLowerCase().includes(lowerQuery))) {
            results.restaurants.push(restaurant);
        }
        restaurant.productsList.forEach(product => {
            if (product.name.toLowerCase().includes(lowerQuery) ||
                (product.description && product.description.toLowerCase().includes(lowerQuery))) {
                results.products.push({ ...product, restaurantId: restaurant.id });
            }
        });
    });
    return results;
}

// update an existing restaurant's details by its ID
const updateRestaurant = (id, name, address, category, phoneNum, imageUrl) => {
    const index = findRestaurantById(id);
    if (index === -1) return false;

    restaurantsList[index].name = name;
    restaurantsList[index].address = address;
    restaurantsList[index].category = category;
    restaurantsList[index].phoneNum = phoneNum;
    restaurantsList[index].imageUrl = imageUrl;

    return true;
}

// delete a restaurant from the list by its ID
const deleteRestaurant = (id) => {
    const index = findRestaurantById(id);
    if (index === -1) {
        return false;
    }

    restaurantsList.splice(index, 1);
    return true;
}

// retrieve all products belonging to a specific restaurant
const getAllProducts = (restaurantId) => {
    const index = findRestaurantById(restaurantId);
    if (index === -1) return [];
    return (restaurantsList[index].productsList);
}

// create a new product inside a specific restaurant's product list
const createProduct = (restaurantId, name, description, category, price, imageUrl) => {
    const index = findRestaurantById(restaurantId);
    if (index === -1) return null;

    if (checkIfProductExist(index, name, description, category, price, imageUrl)) {
        return null;
    }
    const id = idGenerator();
    const newProduct = new product(id, name, description, category, price, imageUrl);
    restaurantsList[index].productsList.push(newProduct);
    return newProduct;
}

// retrieve a specific product by its ID from a specific restaurant
const getProductById = (restaurantId, id) => {
    const restaurantIndex = findRestaurantById(restaurantId);
    if (restaurantIndex === -1) return null;

    const productIndex = findProductByRId(restaurantId, id);
    if (productIndex === -1) return null;

    return (restaurantsList[restaurantIndex].productsList[productIndex]);
}

// delete a specific product from a restaurant's product list
const DeleteProduct = (restaurantId, id) => {
    const restaurantIndex = findRestaurantById(restaurantId);
    if (restaurantIndex === -1) return false;

    const index = restaurantsList[restaurantIndex].productsList.findIndex(product => product.id === id);
    if (index === -1) {
        return false;
    }
    restaurantsList[restaurantIndex].productsList.splice(index, 1);
    return true;
}

// update an existing product's details inside a specific restaurant
const updateProduct = (restaurantId, id, name, description, category, price, imageUrl) => {
    const restaurantIndex = findRestaurantById(restaurantId);
    if (restaurantIndex === -1) return false;

    const index = restaurantsList[restaurantIndex].productsList.findIndex(product => product.id === id);
    if (index === -1) return false;

    restaurantsList[restaurantIndex].productsList[index] = new product(id, name,
        description, category, price, imageUrl);
    return (true);
}

// helper function to check if a restaurant already exists with the exact same details
const checkIfRestaurantExist = (name, address, category, phoneNum, ownerId, imageUrl) => {
    return restaurantsList.findIndex(restaurant => restaurant.name == name &&
        restaurant.address == address && restaurant.category == category
        && restaurant.phoneNum == phoneNum && restaurant.ownerId == ownerId) != -1;
}

// helper function to check if a product already exists with the exact same details inside a restaurant
const checkIfProductExist = (restaurantIndex, name, description, category, price, imageUrl) => {
    return restaurantsList[restaurantIndex].productsList.findIndex(
        product => product.name == name && product.description == description &&
            product.category == category && product.price == price && product.imageUrl == imageUrl) != -1;
}

function idGenerator() {
    return Math.floor(Math.random() * 1000000000).toString();
}

module.exports = {
    findRestaurantById, findProductByRId, createRestaurant, getRestaurantsByOwner,
    getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant,
    getAllProducts, createProduct, getProductById, DeleteProduct, updateProduct, searchEntities
};