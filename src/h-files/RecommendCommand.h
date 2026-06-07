#pragma once
#include "ICommand.h"
#include "IDataRepository.h"
#include "RecommenderEngine.h" 
#include "IIOProvider.h"
#include <vector>
#include <string>
// RecommendCommand class
// This class implements the ICommand interface and is responsible for executing the recommendation
// command It uses an IDataRepository to access user data, a RecommenderEngine to calculate
// recommendations, and an IIOProvider to interact with the user

class RecommendCommand : public ICommand {
private:

    // Pointer to the IDataRepository for data storage and retrieval
    IDataRepository* repo;

    // Pointer to the RecommenderEngine for calculating recommendations
    RecommenderEngine* engine;

public:

    // Constructor that takes pointers to the IDataRepository, RecommenderEngine
    // for data access, recommendation calculation, and user interaction
    RecommendCommand(IDataRepository* r, RecommenderEngine* e);

    // Override of the execute function from the ICommand interface to calculate and display recommendations
    std::string execute(const std::vector<int>& args) override;

    // Override of the getInputStructure function from the ICommand interface to provide
    // information about the expected input format for this command
    std::string getInputStructure() const override {
        return "arguments: [userid] [productid]";
    }
};