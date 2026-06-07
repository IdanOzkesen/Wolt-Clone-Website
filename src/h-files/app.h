#pragma once
#include "IIOProvider.h"
#include "CommandManager.h"
#include "IDataRepository.h"
#include "RecommenderEngine.h"
#include <memory>
// app class
// This class is responsible for running the application, which includes setting up the command manager,
// registering commands, and handling user input.
class app {
    private:
        // CommandManager instance for parsing user input and executing commands
        CommandManager manager;
        // Unique pointer to the IDataRepository for data storage and retrieval
        std::unique_ptr<IDataRepository> repo;
        // Shared pointer to the RecommenderEngine for calculating product recommendations
        std::shared_ptr<RecommenderEngine> engine;
    public:
        // Constructor that initializes the io, manager, and repo member variables with
        // appropriate instances
        app();


        // Function to run the application, which sets up the command manager, registers commands, and
        // continuously reads user input and executes commands until the application is terminated.
        void run(int port);
};