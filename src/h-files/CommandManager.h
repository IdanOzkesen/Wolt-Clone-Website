#pragma once
#include "ICommand.h"
#include "IIOProvider.h"
#include <memory>
#include <string>
#include <vector>
#include <map>

/**
 * CommandManager Class.
 * Acts as the 'Invoker' in the Command Pattern and handles client session logic.
 */
class CommandManager {
private:
    // Map storing command keywords and their corresponding concrete implementations
    std::map<std::string, std::unique_ptr<ICommand>> commands;

    // Helper to tokenize input string
    std::vector<std::string> splitInput(const std::string& input);
    
    // Validates that string arguments can be converted to integers
    std::vector<int> checkInputValidation(const std::vector<std::string>& input);

public:
    CommandManager();

    /**
     * Adds a new command to the system.
     * @param name The keyword that triggers the command (e.g., "post").
     * @param cmd A unique pointer to the command implementation.
     */
    void registerCommand(const std::string& name, std::unique_ptr<ICommand> cmd);

    /**
     * Processes a single raw input string and returns the result.
     */
    std::string sortAndExecute(const std::string& input);

    /**
     * Main loop for handling a client connection through a generic IO provider.
     */
    void handleClient(IIOProvider* io);

    /**
     * Returns a read-only view of registered commands for the HelpCommand to use.
     */
    std::map<std::string, const ICommand*> getRegisteredCommands() const {
        std::map<std::string, const ICommand*> commandPtrs;
        for (const auto& pair : commands) {
            commandPtrs[pair.first] = pair.second.get(); 
        }
        return commandPtrs;
    }
};