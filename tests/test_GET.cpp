#include <gtest/gtest.h>
#include "../src/h-files/RecommendCommand.h"
#include "../src/h-files/FileDataRepository.h"
#include "../src/h-files/RecommenderEngine.h"
#include <fstream>
#include <vector>
#include <string>
#include <cstdio> // For std::remove

// Test fixture class for RecommendCommand
// This test uses the real FileDataRepository and RecommenderEngine without any mocks.
class RecommendCommandTest : public ::testing::Test {
protected:
    FileDataRepository* repo;
    RecommenderEngine* engine;
    const std::string testDbPath = "data/test_recommend_db.txt";

    // SetUp() is executed before each test. 
    // It creates a real text file with the exact dataset provided.
    void SetUp() override {
        std::ofstream outfile(testDbPath);
        if (outfile.is_open()) {
            // Writing the exact dataset provided
            outfile << "1:100,101,102,103\n";
            outfile << "2:101,102,104,105,106\n";
            outfile << "3:100,104,105,107,108\n";
            outfile << "4:101,105,106,107,109,110\n";
            outfile << "5:100,102,103,105,108,111\n";
            outfile << "6:100,103,104,110,111,112,113\n";
            outfile << "7:102,105,106,107,108,109,110\n";
            outfile << "8:101,104,105,106,109,111,114\n";
            outfile << "9:100,103,105,107,112,113,115\n";
            outfile << "10:100,102,105,106,107,109,110,116\n";
            outfile.close();
        }
        
        // Initialize the real repository with the test file we just created

        repo =new FileDataRepository(testDbPath);
        
        // Initialize the real engine with the repository
        engine = new RecommenderEngine(repo);
    }

    // TearDown() cleans up after each test by deleting memory and the test file
    void TearDown() override {
        delete engine;
        delete repo;
        // Delete the temporary test database file
        std::remove(testDbPath.c_str());
    }
};

// Test 1: Verify valid recommendation returns the correct order based on similarity score
TEST_F(RecommendCommandTest, ValidRecommendationReturnsCorrectOrder) {
    RecommendCommand cmd(repo, engine);
    
    // Arguments: User ID 1 is asking for a recommendation based on product 104
    std::vector<int> args = {1, 104}; 
    
    std::string result = cmd.execute(args);
    
    // Expected logic based on the dataset:
    // Score 4: 105
    // Score 3: 106, 111
    // Score 2: 110, 112, 113
    // Score 1: 107, 108, 109, 114
    EXPECT_EQ(result, "200 Ok\n\n105 106 111 110 112 113 107 108 109 114");
}

// Test 2: Verify that asking for a recommendation for a non-existent user returns 404
TEST_F(RecommendCommandTest, NonExistentUserReturns404) {
    RecommendCommand cmd(repo, engine);
    
    // Arguments: User ID 99 does not exist in the dataset
    std::vector<int> args = {99, 104}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to return a 404 Not Found status
    EXPECT_EQ(result, "404 Not Found");
}

// Test 3: Verify that missing arguments (e.g., no product ID) returns 400 Bad Request
TEST_F(RecommendCommandTest, MissingArgumentsReturns400) {
    RecommendCommand cmd(repo, engine);
    
    // Arguments: Only User ID 1, missing the product ID
    std::vector<int> args = {1}; 
    
    std::string result = cmd.execute(args);
    
    // Expect the command to reject the input format
    EXPECT_EQ(result, "400 Bad Request");
}