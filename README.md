# Restaurant Management API (Exercise 3)
## Repository Structure Note
As permitted by the exercise guidelines, a new dedicated repository was created for **Exercise 3** (the Node.js Web API). The C++ server code from **Exercise 2** remains safely locked in its original, separate repository.

## Description
This is a RESTful API built with Node.js and Express for Exercise 3. It serves as the backend for a food delivery and restaurant management system. The API handles entities such as users, restaurants, products, and orders. Additionally, it integrates directly with a custom C++ recommendation engine via TCP sockets to track user interactions and product views in real-time.

## Prerequisites
* **Node.js** installed on your machine.
* **C++ Recommender Server:** The C++ server from Exercise 2 MUST be running locally on port 8080 before starting this Node.js server. The API relies on this active TCP connection for statistics tracking.

## Installation
To install all required dependencies (like Express), navigate to the project directory and run:
`npm install`

## Running the Application
This system requires two components to run concurrently: the C++ Recommendation Engine and the Node.js API.

### **Step 1: Start the C++ Recommendation Server**
You must start this server first. Navigate to the C++ project directory and choose one of the following methods:

**Option 1: Running via Docker (Recommended)**:
We have provided a `Makefile` that handles building and running the containers automatically.

**1. Start the Server Environment:**
> This builds the Docker image, compiles the C++ code, and runs the server in the background on port 8080.
```bash
make up
```
> *NOTE:
> When you are done, you can shut down the container using:* 
```bash
make down 
```
**2. Run the GTest Suite:(Optional)**
>To run all unit and integration tests inside the container (all the cpp&h files):
```bash
make test
```

**Option 2: Using Make (Standard)**
**1. Execute these commands to compile**

> We will run the server on port 8080.
```bash
mkdir build
cd build
cmake ..
make
./run_server 8080
```

**2. Running tests(Optional)**
```bash
./run_tests
```

### **Step 2: Start the Node.js API (Using Docker)**
Make sure the C++ server is running first (via `make up` in the root directory).
Then, navigate into the `JS` directory where the Node.js API is located.

To build and run the Node.js server automatically, simply run:
```bash
cd JS
make up
```


## **Quick Start / Testing Guide (Using cURL)**
**Important Note:** Many endpoints no longer require a userId just to browse (like searching, viewing all restaurants, or viewing a restaurant's menu). However, personal actions (like viewing a specific product to trigger the recommender, modifying personal data, or making an order) still require authentication. Because the data is stored in memory, you must create a user first and use their generated ID for authenticated requests.

**Follow this exact flow to test the API successfully:**

**1. Create a User**

```Bash
curl -i -X POST http://localhost:10000/api/users \
-H "Content-Type: application/json" \
-d '{"name": "TestUser", "password": "123", "address": "Tel Aviv", "phoneNum": "050-1234567"}'
```
Action: Note that payment is no longer required.

**2. Authenticate (Login) to get your ID**

```Bash
curl -i -X POST http://localhost:10000/api/token \
-H "Content-Type: application/json" \
-d '{"name": "TestUser", "password": "123"}'
```
Action: Copy the id from the JSON response. Replace <USER_ID> in the following commands with this number.

**3. Create a Restaurant**

```Bash
curl -i -X POST http://localhost:10000/api/restaurants \
-H "Content-Type: application/json" \
-d '{"name": "Burger Place", "address": "Tel Aviv", "category": "Fast Food", "phoneNum": "03-1234567"}'
```
Action: Look at the Location header in the response (e.g., Location: /api/restaurants/12345). Copy that ID and replace <REST_ID> below.

**4. Add a Product to the Restaurant**

```Bash
curl -i -X POST http://localhost:10000/api/restaurants/<REST_ID>/products \
-H "Content-Type: application/json" \
-d '{"name": "Fries", "description": "Crispy potato", "category": "Side", "price": 25}'
```
Action: Look at the Location header in the response to get the product ID. Replace <PROD_ID> below.

**5. View a Specific Product (Requires Auth - Triggers C++ Socket)**

```Bash
curl -i -X GET http://localhost:10000/api/restaurants/<REST_ID>/products/<PROD_ID> \
-H "userId: <USER_ID>"
```
**6. Create an Order**

```Bash
curl -i -X POST http://localhost:10000/api/users/<USER_ID>/orders \
-H "Content-Type: application/json" \
-H "userId: <USER_ID>" \
-d '{"userId": "<USER_ID>", "restaurantId": "<REST_ID>", "products": ["<PROD_ID>"], "deliveryAddress": "Tel Aviv"}'
```
Action: The totalPrice is calculated automatically by the server based on the products array. No need to send it manually!

**7. Test the Search Engine (Anonymous Browsing)**

```Bash
curl -i -X GET http://localhost:10000/api/search/Fries
```
Action: Notice that no userId header is required to search!

## API Endpoints Overview
(Note: Replace :id, :restaurantId, :productId, :userid, and :orderId with actual IDs from your system. Include <USER_ID> in headers ONLY where specified).

### Search:
Global search for restaurants and products (No auth required):

```Bash
curl -i -X GET http://localhost:10000/api/search/:query
```
### Restaurants:
Retrieve all restaurants (No auth required):

```Bash
curl -i -X GET http://localhost:10000/api/restaurants
```
Create a new restaurant:

```Bash
curl -i -X POST http://localhost:10000/api/restaurants -H "Content-Type: application/json" -d '{"name": "Restaurant Name", "address": "Address", "category": "Category", "phoneNum": "03-1234567"}'
```
Retrieve a specific restaurant (No auth required):

```Bash
curl -i -X GET http://localhost:10000/api/restaurants/:id
```
Update a restaurant:

```Bash
curl -i -X PATCH http://localhost:10000/api/restaurants/:id -H "Content-Type: application/json" -d '{"id": ":id", "name": "Updated Name", "address": "Updated Address", "category": "Category", "phoneNum": "03-9876543"}'
```
Delete a restaurant (Requires auth):

```Bash
curl -i -X DELETE http://localhost:10000/api/restaurants/:id -H "userId: <USER_ID>"
```
### Products:
Retrieve all products for a restaurant (No auth required):

```Bash
curl -i -X GET http://localhost:10000/api/restaurants/:restaurantId/products
```
Add a new product to a restaurant:

```Bash
curl -i -X POST http://localhost:10000/api/restaurants/:restaurantId/products -H "Content-Type: application/json" -d '{"name": "Product Name", "description": "Yummy", "category": "Food", "price": 50}'
```
Retrieve a specific product (Requires auth - Triggers TCP Server):

```Bash
curl -i -X GET http://localhost:10000/api/restaurants/:restaurantId/products/:productId -H "userId: <USER_ID>"
```
Update a specific product:

```Bash
curl -i -X PATCH http://localhost:10000/api/restaurants/:restaurantId/products/:productId -H "Content-Type: application/json" -d '{"name": "Updated Product", "description": "Very Yummy", "category": "Food", "price": 60}'
```
Delete a product (Requires auth - Triggers TCP Server):

```Bash
curl -i -X DELETE http://localhost:10000/api/restaurants/:restaurantId/products/:productId -H "userId: <USER_ID>"
```
### Users & Authentication:
Register a new user:

```Bash
curl -i -X POST http://localhost:10000/api/users -H "Content-Type: application/json" -d '{"name": "User", "password": "123", "address": "Address", "phoneNum": "050-1234567"}'
```
Authenticate (Login to get User ID):

```Bash
curl -i -X POST http://localhost:10000/api/token -H "Content-Type: application/json" -d '{"name": "User", "password": "123"}'
```
Retrieve a specific user's profile:

```Bash
curl -i -X GET http://localhost:10000/api/users/:userid -H "userId: <USER_ID>"
```
### Orders:
Create a new order:

```Bash
curl -i -X POST http://localhost:10000/api/users/:userid/orders -H "Content-Type: application/json" -H "userId: <USER_ID>" -d '{"userId": ":userid", "restaurantId": ":restaurantId", "products": [":productId"], "deliveryAddress": "Address"}'
```
Retrieve all orders for a specific user:

```Bash
curl -i -X GET http://localhost:10000/api/users/:userid/orders -H "userId: <USER_ID>"
```
Retrieve a specific order:

```Bash
curl -i -X GET http://localhost:10000/api/users/:userid/orders/:orderId -H "userId: <USER_ID>"
```
Update an order's details:

```Bash
curl -i -X PATCH http://localhost:10000/api/users/:userid/orders/:orderId -H "Content-Type: application/json" -H "userId: <USER_ID>" -d '{"userId": ":userid", "restaurantId": ":restaurantId", "products": [":productId"], "deliveryAddress": "New Address"}'
```
Delete an order:

```Bash
curl -i -X DELETE http://localhost:10000/api/users/:userid/orders/:orderId -H "userId: <USER_ID>"
```