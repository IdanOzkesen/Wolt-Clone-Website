#include "../h-files/RecommenderEngine.h"
#include <algorithm>
#include <vector>
#include <map>
using namespace std;

// RecommenderEngine.cpp
// Implementation of the RecommenderEngine class, which is responsible for calculating product
// recommendations based on user data and similarity scores.

// Constructor that takes a pointer to an IDataRepository for data access
RecommenderEngine::RecommenderEngine(IDataRepository* d) {
    data = d;
}

// Comparison function to sort products based on their recommendation scores in descending order.
// If two products have the same score, they are sorted by their ID in ascending order.
bool RecommenderEngine::cmp(const pair<int, int>& a, const pair<int, int>& b) {
    // Primary sort: Score (descending)
    if (a.second != b.second) {
        return a.second > b.second; 
    }
    // Secondary sort: Product ID (ascending) - This is the tie-breaker for same scores
    return a.first < b.first;
}

// Function to calculate product recommendations for a given user and product based on all user data
vector<int> RecommenderEngine::calculate(const int& userId, const int& productId) {
    auto productToUser = data->getProductToUser();
    auto userToProduct = data->getUserToProduct();

    // Map to store the recommendation scores for each product
    map<int, int> productScores; 
    
    // Get the original user's viewed products and sort them for binary search/intersection
    vector<int> productsOfTheOG = userToProduct[userId];
    sort(productsOfTheOG.begin(), productsOfTheOG.end());

    vector<int> usersWhoSawTarget = productToUser[productId];

    // For each user, calculate the similarity score based on the number of common products 
    // seen with the original user
    for (const auto& otherUserId : usersWhoSawTarget) {
        if (otherUserId == userId) {
            continue;
        } 
        
        vector<int> otherUserProducts = userToProduct[otherUserId];
        sort(otherUserProducts.begin(), otherUserProducts.end());

        // Calculate the number of common products between the original user and the other user
        vector<int> commonProducts;
        set_intersection(productsOfTheOG.begin(), productsOfTheOG.end(),
                        otherUserProducts.begin(), otherUserProducts.end(),
                        back_inserter(commonProducts));
                         
        int similarityScore = commonProducts.size();

        // If similarity score is greater than 0, update scores for products the other user saw
        if (similarityScore > 0) {
            for (const int& recommendedProduct : otherUserProducts) {
                // Update score if it's not the target product and if the OG user hasn't seen it
                if (recommendedProduct != productId && 
                    !binary_search(productsOfTheOG.begin(), productsOfTheOG.end(), recommendedProduct)) {
                    productScores[recommendedProduct] += similarityScore;
                }
            }
        }
    }

    // Convert map to vector for sorting
    vector<pair<int, int>> sortedProducts(productScores.begin(), productScores.end());
    
    // Sort products using the custom comparator with the tie-breaker logic
    sort(sortedProducts.begin(), sortedProducts.end(), cmp);

    vector<int> results;
    int counter = 0;
    // Collect the top 10 recommended products
    for (const auto& p : sortedProducts) {
        results.push_back(p.first);
        counter++;
        if(counter >= 10) {
            break;
        }
    }
    return results;
}