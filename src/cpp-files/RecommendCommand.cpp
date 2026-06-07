#include "../h-files/RecommendCommand.h"
#include <algorithm>
#include <map>
#include <vector>
#include <stdexcept>
using namespace std;
// RecommendCommand.cpp
// Implementation of the RecommendCommand class, which is responsible for executing the "recommend" command

// Constructor that initializes the repo, engine, and io member variables with the provided pointers
RecommendCommand::RecommendCommand(IDataRepository* r, RecommenderEngine* e) {
    repo = r;
    engine = e;
}

// Override of the execute function to calculate and display recommendations
// This function takes a vector of strings as arguments, where the first argument is the user ID
string RecommendCommand::execute(const vector<int>& args) {
    if(args.size() != 2) {
        return ("400 Bad Request");
    }
    auto userMap = repo->getUserToProduct();
    auto productMap = repo->getProductToUser();
    // Check if the user exists in the system
    // Check if the product exists in the system
    auto userIt = userMap.find(args[0]);
    if (userMap.find(args[0]) == userMap.end() || productMap.find(args[1]) == productMap.end()) {
        return ("404 Not Found");
    }
    // Call the calculate function of the RecommenderEngine to get the list of recommended
    // products for the given user ID and product ID.
    auto resolt = engine->calculate(args[0], args[1]);
    // If the result is empty, return without doing anything. Otherwise, join the recommended product IDs
    // into a single string separated by spaces and print it using the IIOProvider.
    if (resolt.empty()) {
        return ("200 Ok");
    }
    // turn the recommended product IDs from vector<int> to vector<string> for output
    vector<string> resoltStr;
    for (const int& productId : resolt) {
        resoltStr.push_back(to_string(productId));
    }
    // Join the recommended product IDs into a single string separated by spaces
    string output = "200 Ok\n\n";
    for (size_t i = 0; i < resoltStr.size(); i++) {
        output += resoltStr[i];
        if (i < resoltStr.size() - 1) {
            output += " ";
        }
    }
    return(output);
}