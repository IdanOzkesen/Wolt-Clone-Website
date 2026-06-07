#pragma once
#include <IDataRepository.h>
#include <vector>
#include <string>
#include <utility>
// RecommenderEngine.h
// This class is responsible for calculating product recommendations based on user data

class RecommenderEngine {
private:
    // Pointer to the IDataRepository for data storage and retrieval
    IDataRepository* data;
    // Comparison function to sort products based on their recommendation scores in descending order
static bool cmp(const std::pair<int, int>& a, const std::pair<int, int>& b);

public:

    // Constructor that takes a pointer to an IDataRepository for data access
    RecommenderEngine(IDataRepository* d);

    // Function to calculate product recommendations for a given user and product based on all user data
    // It takes a map of all user data, the user ID for whom recommendations are to
    // be calculated, and the product ID for which recommendations are needed
    std::vector<int> calculate(const int& userId, const int& productId);
};