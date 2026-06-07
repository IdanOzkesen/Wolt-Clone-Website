#include "../h-files/PATCHCommand.h"
#include <string>
#include <vector>

using namespace std;

/**
 * Constructor for PATCHCommand.
 * @param repository Pointer to the data storage following Dependency Inversion.
 */
PATCHCommand::PATCHCommand(IDataRepository* repository) {
    repo = repository;
}

/**
 * Executes the PATCH logic: Updates an existing user's viewed products.
 * @param args Vector of integers where args[0] is UserID and the rest are ProductIDs.
 * @return Response string (204 on success, 400 for bad args, 404 if user missing).
 */
string PATCHCommand::execute(const vector<int>& args) {
    if(args.size() < 2) {
        return("400 Bad Request");
    }
    
    auto& userMap = repo->getUserToProduct();
    // Check if user exists before attempting to patch
    if(userMap.find(args[0]) == userMap.end()) {
        return("404 Not Found");
    }
    
    // Extract product IDs starting from the second element
    vector<int> products(args.begin() + 1, args.end());
    repo->saveUserViews(args[0], products);
    
    return("204 No Content");
}