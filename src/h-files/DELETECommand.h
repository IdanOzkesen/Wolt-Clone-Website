#pragma once
#include "ICommand.h"
#include "IDataRepository.h"

class DELETECommand : public ICommand {
    private:
        IDataRepository* repo; // Injected dependency
    public:
        DELETECommand(IDataRepository* repository);         
        std::string execute(const std::vector<int>& args) override;

        std::string getInputStructure() const override {
            return "arguments: [userid] [productid1] [productid2] ...";
        }    
};