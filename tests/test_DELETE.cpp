#include <gtest/gtest.h>
#include "../src/h-files/DELETECommand.h"
#include "../src/h-files/FileDataRepository.h"
#include <fstream>
#include <vector>
#include <string>
#include <cstdio> // For std::remove

// Test fixture class for DELETECommand
// This test uses the real FileDataRepository without any mocks.
class DELETECommandTest : public ::testing::Test {
protected:
    FileDataRepository* repo;
    const std::string testDbPath = "data/test_delete_db.txt";

    // SetUp() is executed before each test.
    // It creates a temporary database file with one existing user for testing.
    void SetUp() override {
        std::ofstream outfile(testDbPath);
        if (outfile.is_open()) {
            // User ID 1 already exists and has viewed products 101, 102, 103
            outfile << "1:101,102,103\n"; 
            outfile.close();
        }
        
        // Initialize the real repository with the test file
        repo = new FileDataRepository(testDbPath);
    }

    // TearDown() cleans up after each test
    void TearDown() override {
        delete repo;
        // Delete the temporary test database file
        std::remove(testDbPath.c_str());
    }
};

// Test 1: Verify that deleting an existing product from an existing user returns success
TEST_F(DELETECommandTest, DeleteExistingProductReturnsSuccess) {
    DELETECommand cmd(repo);
    
    // Arguments: User ID 1, deleting product 102
    std::vector<int> args = {1, 102}; 
    
    std::string result = cmd.execute(args);
    
    // Depending on your server design, successful DELETE might return "200 OK".
    // Using find to be flexible with exact string formatting (e.g., if you return "200 OK deleted")
    EXPECT_EQ(result, "204 No Content");
}

// Test 2: Verify that trying to delete a product the user hasn't viewed returns 404
TEST_F(DELETECommandTest, DeleteNonExistentProductReturns404) {
    DELETECommand cmd(repo);
    
    // Arguments: User ID 1, trying to delete product 999 (which they haven't viewed)
    std::vector<int> args = {1, 999}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the operation since the product is not found in their history
    EXPECT_EQ(result, "404 Not Found");
}

// Test 3: Verify that trying to delete views for a non-existent user returns 404
TEST_F(DELETECommandTest, DeleteForNonExistentUserReturns404) {
    DELETECommand cmd(repo);
    
    // Arguments: User ID 99 (does not exist), trying to delete product 101
    std::vector<int> args = {99, 101}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject since the user is not found
    EXPECT_EQ(result, "404 Not Found");
}

// Test 4: Verify that missing arguments (no product IDs) returns 400 Bad Request
TEST_F(DELETECommandTest, MissingArgumentsReturns400) {
    DELETECommand cmd(repo);
    
    // Arguments: Only User ID 1, missing product IDs to delete
    std::vector<int> args = {1}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the invalid input format
    EXPECT_EQ(result, "400 Bad Request");
}