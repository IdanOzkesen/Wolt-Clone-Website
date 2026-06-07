#include "../h-files/app.h"
#include "../h-files/StandardIOProvider.h"
#include "../h-files/FileDataRepository.h"
#include "../h-files/HelpCommand.h"
#include "../h-files/RecommendCommand.h"
#include "../h-files/PATCHCommand.h"
#include "../h-files/POSTCommand.h"
#include "../h-files/DELETECommand.h"
#include "../h-files/TcpServer.h"
#include <sstream>
#include <iostream>
#include <fstream>
#include <filesystem>
#include <map>
#include <vector>
using namespace std;
// app.cpp
// Implementation of the app class, which is responsible for running the application, which
// includes setting up the command manager, registering commands, and handling user input.
// Constructor that initializes the io, manager, and repo member variables with appropriate instances

app::app() :
    manager(),
    repo (make_unique<FileDataRepository>("data/db.txt")) {
    engine = make_shared<RecommenderEngine>(repo.get());
    manager.registerCommand("GET", make_unique<RecommendCommand>(repo.get(), engine.get()));
    manager.registerCommand("HELP", make_unique<HelpCommand>(&manager));
    manager.registerCommand("PATCH", make_unique<PATCHCommand>(repo.get()));
    manager.registerCommand("POST", make_unique<POSTCommand>(repo.get()));
    manager.registerCommand("DELETE", make_unique<DELETECommand>(repo.get()));
}

// Function to run the application, which sets up the command manager, registers commands, and
// continuously reads user input and executes commands until the application is terminated.
void app::run(int port) {
    try
    {
        TcpServer server = TcpServer(&manager);
        server.start(port);
        server.run();
    }
    catch(const std::exception& e)
    {
        return;
    }
}