#include <gtest/gtest.h>
#include "../src/h-files/RecommenderEngine.h"
#include "../src/h-files/IDataRepository.h" 
#include <vector>
#include <map>

// =====================================================================
// The Dummy (Mock) Class
// We use this to test the math logic without touching physical files.
// =====================================================================

// Note: Replace "IDataRepository" with whatever interface RecommenderEngine 
// expects in its constructor. If it expects FileDataRepository directly without 
// an interface, this mock needs to inherit from FileDataRepository.
class MockDataRepository : public IDataRepository {
public:
    std::map<int, std::vector<int>> fakeUserToProduct;
    std::map<int, std::vector<int>> fakeProductToUser;

    // Override the interface methods to return our fake data from memory
    const std::map<int, std::vector<int>>& getUserToProduct() override {
        return fakeUserToProduct;
    }

    const std::map<int, std::vector<int>>& getProductToUser() override {
        return fakeProductToUser;
    }
    void saveUserViews(const int& userId, const std::vector<int>& productIds) override {}
    void deleteUserViews(const int& userId, const std::vector<int>& productIds) override {}
};

// =====================================================================
// Test Suite: RecommenderEngine
// =====================================================================

class RecommenderEngineTest : public ::testing::Test {
protected:
    MockDataRepository* mockRepo;
    RecommenderEngine* engine;

    // SetUp creates a fresh mock and engine before each test
    void SetUp() override {
        mockRepo = new MockDataRepository();
        engine = new RecommenderEngine(mockRepo);
    }

    // TearDown cleans up memory after each test
    void TearDown() override {
        delete engine;
        delete mockRepo;
    }
};

// Test 1: Full integration test with the assignment's exact dataset
TEST_F(RecommenderEngineTest, CalculatesRecommendationsCorrectly) {
    // --- Arrange ---
    mockRepo->fakeUserToProduct = {
        {1, {100, 101, 102, 103}}, 
        {2, {101, 102, 104, 105, 106}},
        {3, {100, 104, 105, 107, 108}},
        {4, {101, 105, 106, 107, 109, 110}},
        {5, {100, 102, 103, 105, 108, 111}},
        {6, {100, 103, 104, 110, 111, 112, 113}},
        {7, {102, 105, 106, 107, 108, 109, 110}},
        {8, {101, 104, 105, 106, 109, 111, 114}},
        {9, {100, 103, 105, 107, 112, 113, 115}},
        {10, {100, 102, 105, 106, 107, 109, 110, 116}}
    };

    mockRepo->fakeProductToUser = {
        {100, {1, 3, 5, 6, 9, 10}},
        {101, {1, 2, 4, 8}},
        {102, {1, 2, 5, 7, 10}},
        {103, {1, 5, 6, 9}},
        {104, {2, 3, 6, 8}}, 
        {105, {2, 3, 4, 5, 7, 8, 9, 10}},
        {106, {2, 4, 7, 8, 10}},
        {107, {3, 4, 7, 9, 10}},
        {108, {3, 5, 7}},
        {109, {4, 7, 8, 10}},
        {110, {4, 6, 7, 10}},
        {111, {5, 6, 8}},
        {112, {6, 9}},
        {113, {6, 9}},
        {114, {8}},
        {115, {9}},
        {116, {10}}
    };

    // --- Act ---
    std::vector<int> results = engine->calculate(1, 104);

    // --- Assert ---
    ASSERT_FALSE(results.empty()); 
    ASSERT_EQ(results.size(), 10);
    
    EXPECT_EQ(results[0], 105);
    EXPECT_EQ(results[1], 106);
    EXPECT_EQ(results[2], 111);
    EXPECT_EQ(results[3], 110);
    EXPECT_EQ(results[4], 112);
    EXPECT_EQ(results[5], 113);
    EXPECT_EQ(results[6], 107);
    EXPECT_EQ(results[7], 108);
    EXPECT_EQ(results[8], 109);
    EXPECT_EQ(results[9], 114);
}

// Test 2: Edge case - Non-existent user or product
TEST_F(RecommenderEngineTest, ReturnsEmptyVectorForNonExistentUserOrProduct) {
    // Arrange: Minimal valid data, but doesn't have the specific user/product
    mockRepo->fakeUserToProduct = {{1, {100, 101}}};
    mockRepo->fakeProductToUser = {{100, {1}}, {101, {1}}};

    // Act
    std::vector<int> recommendations = engine->calculate(999, 999);

    // Assert: Safely return an empty vector without crashing
    EXPECT_TRUE(recommendations.empty());
}

// Test 3: Edge case - Known user, unknown product
TEST_F(RecommenderEngineTest, HandlesNonExistentProductWithoutCrashing) {
    // Arrange: Known users and products
    mockRepo->fakeUserToProduct = {{1, {101, 102}}};
    mockRepo->fakeProductToUser = {{101, {1}}, {102, {1}}};
    
    // Act & Assert: The engine must safely catch this and not throw a segfault
    std::vector<int> results;
    EXPECT_NO_THROW({
        results = engine->calculate(1, 999);
    });
    
    EXPECT_TRUE(results.empty()); 
}

// Test 4: Edge case - Not enough products to recommend 10 items
TEST_F(RecommenderEngineTest, ReturnsFewerThanTenWhenNotEnoughProducts) {
    // Arrange: Scenario where only 2 items can possibly be recommended
    mockRepo->fakeUserToProduct = {
        {1, {101}}, 
        {2, {101, 102, 103}} // User 2 has 102 and 103 to recommend
    };
    mockRepo->fakeProductToUser = {
        {101, {1, 2}}, 
        {102, {2}}, 
        {103, {2}}
    };
    
    // Act
    std::vector<int> results = engine->calculate(1, 101); 
    
    // Assert: Return exactly 2 items without padding the array
    EXPECT_EQ(results.size(), 2); 
}