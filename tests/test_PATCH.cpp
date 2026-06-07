#include <gtest/gtest.h>
#include "../src/h-files/PATCHCommand.h"
#include "../src/h-files/FileDataRepository.h"
#include <fstream>
#include <vector>
#include <string>
#include <cstdio> // For std::remove

// Test fixture class for PATCHCommand
// This test uses the real FileDataRepository without any mocks.
class PATCHCommandTest : public ::testing::Test {
protected:
    FileDataRepository* repo;
    const std::string testDbPath = "data/test_patch_db.txt";

    // SetUp() is executed before each test.
    // It creates a temporary database file with one existing user for testing.
    void SetUp() override {
        std::ofstream outfile(testDbPath);
        if (outfile.is_open()) {
            // User ID 1 already exists and has viewed products 101, 102
            outfile << "1:101,102\n"; 
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

// Test 1: Verify that updating an existing user's views returns success 
TEST_F(PATCHCommandTest, UpdateExistingUserReturnsSuccess) {
    PATCHCommand cmd(repo);
    
    // Arguments: User ID 1 (exists), adding new products 103 and 104
    std::vector<int> args = {1, 103, 104}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to successfully update the resource
    EXPECT_EQ(result, "204 No Content");
}

// Test 2: Verify that trying to update a user that does not exist returns 404
TEST_F(PATCHCommandTest, UpdateNonExistentUserReturns404) {
    PATCHCommand cmd(repo);
    
    // Arguments: User ID 99 (does not exist), adding product 103
    std::vector<int> args = {99, 103}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the operation since the user is not found
    EXPECT_EQ(result, "404 Not Found");
}

// Test 3: Verify that missing arguments (no product IDs) returns 400 Bad Request
TEST_F(PATCHCommandTest, MissingArgumentsReturns400) {
    PATCHCommand cmd(repo);
    
    // Arguments: Only User ID 1, missing product IDs to add
    std::vector<int> args = {1}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the invalid input format
    EXPECT_EQ(result, "400 Bad Request");
}