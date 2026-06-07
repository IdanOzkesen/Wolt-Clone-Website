#pragma once
#include "ICommand.h"
#include "IDataRepository.h"

// POSTCommand class
// This class implements the ICommand interface and is responsible for executing the "post" command,
class POSTCommand : public ICommand {
private:
    // Pointer to the IDataRepository for data storage and retrieval
    IDataRepository* repo;
public:
    // Constructor that takes an IDataRepository pointer for data storage and retrieval
    POSTCommand(IDataRepository* repository);  
    
    // Override of the execute function from the ICommand interface to retrieve user views from the repository
    // This function takes a vector of strings as arguments, where the first argument is the user
    std::string execute(const std::vector<int>& args) override;    
    
    // Override of the getInputStructure function from the ICommand interface to provide information about the expected input format for the "post" command
    std::string getInputStructure() const override
    {
        return "arguments: [userid] [productid1] [productid2] ...";
    }
};