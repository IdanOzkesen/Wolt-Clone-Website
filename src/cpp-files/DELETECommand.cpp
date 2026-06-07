#include "../h-files/DELETECommand.h"
#include <map>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Constructor injecting the data repository dependency.
 */
DELETECommand::DELETECommand(IDataRepository* repository) {
    repo = repository;
}

/**
 * Executes the DELETE logic: Removes specific product views from a user's history.
 * @param args args[0]: UserID, args[1...n]: ProductIDs to remove.
 * @return 204 No Content on success, 404 if user or specific product views are missing.
 */
string DELETECommand::execute(const vector<int>& args) {
    if(args.size() < 2) {
        return("400 Bad Request");
    }
    int userId = args[0];
    // Work on a mutable copy because the input is const
    auto& userMap = repo->getUserToProduct();
    // Validate user exists
    if(userMap.find(userId) == userMap.end()) {
        return("404 Not Found");
    }

    vector<int> productsToDelete(args.begin() + 1, args.end());
    vector<int> checkForDubels = productsToDelete;
    sort(checkForDubels.begin(), checkForDubels.end());
    auto last = std::unique(checkForDubels.begin(), checkForDubels.end());
    checkForDubels.erase(last, checkForDubels.end());
    if (productsToDelete.size() != checkForDubels.size()) {
        return("404 Not Found");
    }

    vector<int> intersectionResult;
    
    // Sort to use set_intersection for validating that the user has actually seen these products
    vector<int> currentUserProducts = userMap.at(userId);
    sort(currentUserProducts.begin(), currentUserProducts.end());
    sort(productsToDelete.begin(), productsToDelete.end());

    set_intersection(productsToDelete.begin(), productsToDelete.end(),
                        currentUserProducts.begin(), currentUserProducts.end(),
                        back_inserter(intersectionResult));

    // If the count of existing views to delete doesn't match the input, some products weren't seen by the user
    if(intersectionResult.size() != productsToDelete.size()) {
        return("404 Not Found");
    }

    repo->deleteUserViews(userId, productsToDelete);
    return("204 No Content");
}