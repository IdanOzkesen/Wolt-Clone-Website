#pragma once
#include "ICommand.h"
#include "IDataRepository.h"
#include <vector>
#include <string>
// PATCHCommand class
// This class implements the ICommand interface and is responsible for executing the "patch" command,
// which updates user views in the IDataRepository based on the provided arguments if the user ID already exists.

class PATCHCommand : public ICommand {
private:
    // Pointer to the IDataRepository for data storage and retrieval for updating user
    // views and checking if the user ID already exists
    IDataRepository* repo;
public:
    // Constructor that takes an IDataRepository pointer for data storage and retrieval
    PATCHCommand(IDataRepository* repository);
    
    // Override of the execute function from the ICommand interface to update user views in the repository
    // This function takes a vector of strings as arguments, where the first argument is the user
    // ID and the subsequent arguments are product IDs that the user has viewed. It first checks
    // if the user ID already exists If the user ID exists, it updates the user views, If the user
    // ID does not exist, it does nothing.
    std::string execute(const std::vector<int>& args) override;

    // Override of the getInputStructure function from the ICommand interface to provide
    // information about the expected input format for this command
    std::string getInputStructure() const override {
        return "[userid] [productid1] [productid2] ...";
    }    
};