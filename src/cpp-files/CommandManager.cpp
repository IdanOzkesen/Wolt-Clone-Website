#include "../h-files/CommandManager.h"
#include <sstream>
#include <iostream>
#include <fstream>
#include <filesystem>
#include <map>
#include <vector>
#include <algorithm>
using namespace std;

/**
 * CommandManager implementation.
 * Manages the lifecycle of a client session by parsing raw input into executable commands.
 */
CommandManager::CommandManager() {
}
/**
 * 
 * Registers a command object to a specific string keyword.
 * Uses unique_ptr to manage command lifetime automatically.
 */
void CommandManager::registerCommand(const string& name, unique_ptr<ICommand> cmd) {
    commands[name] = std::move(cmd);
}

/**
 * Parses raw input string, validates the command exists, and handles execution.
 * @param input Raw string from the IO provider.
 * @return Response string to be sent back to the client.
 */
string CommandManager::sortAndExecute(const string& input) {
    vector<string> parts = splitInput(input);
    
    // Validate input is not empty and contains no illegal tab characters
    if(parts.empty() || input.find('\t') != string::npos) {
        return("400 Bad Request");
    }

    // Normalize command name to uppercase for case-insensitivity
    string commandName = parts[0];
    for (auto& c : commandName) {
        c = toupper((unsigned char)c);
    }

    // Check if the command is registered in the map
    if (commands.find(commandName) == commands.end()) {
        return("400 Bad Request");
    }

    // Extract arguments and validate that they are numerical (as per system requirements)
    vector<string> commandInput(parts.begin() + 1, parts.end());
    vector<int> intInput = checkInputValidation(commandInput);
    
    // If arguments were expected but validation failed, return error
    if(!commandInput.empty() && intInput.empty()) {
        return("400 Bad Request");
    }

    // Execute the command logic and return the result string
    return commands[commandName]->execute(intInput);
}

/**
 * Helper: Splits input string by whitespace into a vector of strings.
 */
vector<string> CommandManager::splitInput(const string& input) {
    vector<string> parts;
    stringstream ss(input);
    string part;
    while (ss >> part) {
        parts.push_back(part);
    }
    return parts;
}

/**
 * Validates that all provided argument strings represent valid integers.
 * @return A vector of integers on success, or an empty vector if any validation fails.
 */
vector<int> CommandManager::checkInputValidation(const vector<string>& input) {
    vector<int> intArgs;
    for(const auto& s : input) {
        // Ensure string is not empty and consists only of digits
        if(s.empty() || !all_of(s.begin(), s.end(), ::isdigit)) {
            return {};
        }
        try {
            int val = stoi(s);
            intArgs.push_back(val);
        } 
        catch (const out_of_range& e) {
            return {}; // Handle integer overflow
        }
    }
    return intArgs;
}

/**
 * The main interaction loop for a single client.
 * Decoupled from the network via the IIOProvider interface.
 */
void CommandManager::handleClient(IIOProvider* io) {
    while (true) {
        try
        {
            string input = io->getLine();
            string output = sortAndExecute(input);
            io->returnLine(output);
            }
            catch(const int e)
            {
                // if e == 0 then the user left
                // if e < 0 then ERROR
                return;
        }
    }
}