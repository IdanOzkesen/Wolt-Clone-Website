#include <gtest/gtest.h>
#include "../src/h-files/POSTCommand.h"
#include "../src/h-files/FileDataRepository.h"
#include <fstream>
#include <vector>
#include <string>
#include <cstdio> // For std::remove

// Test fixture class for POSTCommand
// This allows us to set up a clean testing environment before each test runs
class POSTCommandTest : public ::testing::Test {
protected:
    FileDataRepository* repo;
    const std::string testDbPath = "data/test_post_db.txt";

    // SetUp() is executed right before each TEST_F starts
    void SetUp() override {
        // Create a temporary database file with one existing user for testing
        std::ofstream outfile(testDbPath);
        if (outfile.is_open()) {
            outfile << "1:101,102\n"; // User ID 1 already exists in the system
            outfile.close();
        }
        
        // Initialize the repository with the test database
        repo = new FileDataRepository(testDbPath);
    }

    // TearDown() is executed immediately after each TEST_F finishes
    void TearDown() override {
        // Free allocated memory
        delete repo;
        
        // Delete the temporary test file from the disk to keep the environment clean
        std::remove(testDbPath.c_str());
    }
};

// Test 1: Verify that adding a completely new user returns "201 Created"
TEST_F(POSTCommandTest, AddNewUserSuccessReturns201) {
    POSTCommand cmd(repo);
    
    // Arguments: User ID 2 (new), followed by product IDs
    std::vector<int> args = {2, 201, 202}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to successfully create the resource
    EXPECT_EQ(result, "201 Created");
}

// Test 2: Verify that trying to add a user that already exists returns "400 Bad Request"
TEST_F(POSTCommandTest, AddExistingUserFailsReturns400) {
    POSTCommand cmd(repo);
    
    // Arguments: User ID 1 (already exists from SetUp), followed by product IDs
    std::vector<int> args = {1, 301, 302}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the operation and return an error
    EXPECT_EQ(result, "404 Not Found");
}

// Test 3: Verify that missing arguments (e.g., only user ID, no products) returns "400 Bad Request"
TEST_F(POSTCommandTest, MissingArgumentsReturns400) {
    POSTCommand cmd(repo);
    
    // Arguments: Only User ID 3, missing product IDs
    std::vector<int> args = {3}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the invalid input structure
    EXPECT_EQ(result, "400 Bad Request");
}