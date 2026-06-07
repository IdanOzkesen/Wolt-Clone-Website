#include <gtest/gtest.h>
#include "../src/h-files/FileDataRepository.h"
#include <filesystem>
#include <fstream>

// =====================================================================
// Test Suite: FileDataRepository
// =====================================================================

// Test fixture class for FileDataRepository
class FileDataRepositoryTest : public ::testing::Test {
protected:
    FileDataRepository* repo;
    const std::string testDir = "test_data";
    const std::string testPath = "test_data/test_db.txt";

    // SetUp() runs before every single test
    void SetUp() override {
        // Ensure the directory exists
        std::filesystem::create_directories(testDir);
        
        // Clean up any leftover file from previous crashed runs
        if (std::filesystem::exists(testPath)) {
            std::filesystem::remove(testPath);
        }
        
        // Initialize the repository with the clean test path
        repo = new FileDataRepository(testPath);
    }

    // TearDown() runs after every single test
    void TearDown() override {
        delete repo;
        // Clean up the test file automatically so tests don't step on each other
        if (std::filesystem::exists(testPath)) {
            std::filesystem::remove(testPath);
        }
    }
    
    // Helper function to quickly populate a file for read/delete tests
    void createMockFile(const std::string& content) {
        std::ofstream outfile(testPath);
        if (outfile.is_open()) {
            outfile << content;
            outfile.close();
        }
    }
};

// Test 1: Verify saving new data and reading it back correctly
TEST_F(FileDataRepositoryTest, SavesAndRetrievesDataCorrectly) {
    // --- Arrange ---
    int user1 = 1;
    std::vector<int> testProducts1 = {101, 102};
    int user2 = 2;
    std::vector<int> testProducts2 = {102, 103};

    // --- Act ---
    repo->saveUserViews(user1, testProducts1);
    repo->saveUserViews(user2, testProducts2);
    
    // Create a fresh instance to force reading from the physical file we just wrote to
    FileDataRepository readerRepo(testPath);
    auto userToProductData = readerRepo.getUserToProduct();
    auto productToUserData = readerRepo.getProductToUser();
    
    // --- Assert ---
    // Check User-to-Product map
    ASSERT_EQ(userToProductData.size(), 2);
    EXPECT_EQ(userToProductData[user1].size(), 2);
    EXPECT_EQ(userToProductData[user1][0], 101);
    EXPECT_EQ(userToProductData[user1][1], 102);
    
    // Check Product-to-User map
    ASSERT_EQ(productToUserData.size(), 3);
    EXPECT_EQ(productToUserData[101].size(), 1);
    EXPECT_EQ(productToUserData[102].size(), 2); // Both users viewed 102
}

// Test 2: Verify that adding duplicate products for the same user is ignored
TEST_F(FileDataRepositoryTest, PreventsDuplicateProductsForSameUser) {
    // Act: Attempt to add the exact same product multiple times
    repo->saveUserViews(1, {101, 101, 101});
    repo->saveUserViews(1, {101}); // Add again later
    
    // Assert: The user's product list should only contain one instance of 101
    auto userMap = repo->getUserToProduct();
    EXPECT_EQ(userMap[1].size(), 1);
}

// Test 3: Verify that loading an existing file populates the maps correctly
TEST_F(FileDataRepositoryTest, LoadAllDataFromFileCorrectly) {
    // Arrange: Write exact data from the assignment table to a physical file
    createMockFile("1:100,101,102,103\n2:101,102,104,105,106\n");

    // Act: Initialize a new repository to read the file
    FileDataRepository readerRepo(testPath);
    auto userToProduct = readerRepo.getUserToProduct();
    auto productToUser = readerRepo.getProductToUser();

    // Assert: Verify User 1 is loaded correctly
    ASSERT_TRUE(userToProduct.count(1));
    EXPECT_EQ(userToProduct[1].size(), 4);
    EXPECT_EQ(userToProduct[1][0], 100);
    EXPECT_EQ(userToProduct[1][3], 103);

    // Assert: Verify Product 104 is loaded correctly and mapped to User 2
    ASSERT_TRUE(productToUser.count(104));
    EXPECT_EQ(productToUser[104].size(), 1);
    EXPECT_EQ(productToUser[104][0], 2);
}

// Test 4: Verify that deleting a product removes it from both maps and the file
TEST_F(FileDataRepositoryTest, DeletesUserViewsSuccessfully) {
    // --- Arrange ---
    // Setup initial data: User 1 viewed 101, 102, 103
    createMockFile("1:101,102,103\n");
    FileDataRepository testRepo(testPath); // Loads the file
    
    // --- Act ---
    // Delete product 102 from User 1
    testRepo.deleteUserViews(1, {102});
    
    // --- Assert ---
    // 1. Verify in-memory User map updated
    auto userMap = testRepo.getUserToProduct();
    ASSERT_EQ(userMap[1].size(), 2);
    // Product 102 should be gone, only 101 and 103 remain
    EXPECT_EQ(userMap[1][0], 101); 
    EXPECT_EQ(userMap[1][1], 103);
    
    // 2. Verify in-memory Product map updated
    auto productMap = testRepo.getProductToUser();

    EXPECT_EQ(productMap[102].size(), 0);
    
    // 3. Verify physical file updated
    std::ifstream infile(testPath);
    std::string line;
    std::getline(infile, line);
    infile.close();
    
    // The line in the file should now only contain 101 and 103
    EXPECT_EQ(line, "1:101,103,");
}