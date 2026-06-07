#include "../h-files/POSTCommand.h"
#include <string>
#include <vector>

using namespace std;

/**
 * Constructor for POSTCommand.
 */
POSTCommand::POSTCommand(IDataRepository* repository) {
    repo = repository;
}

/**
 * Executes the POST logic: Creates a new user entry with viewed products.
 * @return Response string (201 on success, 404 if user already exists).
 */
string POSTCommand::execute(const vector<int>& args) {
    if(args.size() < 2) {
        return("400 Bad Request");
    }
    
    auto& userMap = repo->getUserToProduct();
    // In REST logic, POST usually fails if the resource already exists
    if(userMap.find(args[0]) != userMap.end()) {
        return("404 Not Found");
    }
    
    vector<int> products(args.begin() + 1, args.end());
    repo->saveUserViews(args[0], products);
    
    return("201 Created");
}