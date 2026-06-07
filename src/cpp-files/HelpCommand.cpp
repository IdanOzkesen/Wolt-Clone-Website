#include "../h-files/HelpCommand.h"
#include "../h-files/CommandManager.h"
#include <string>
#include <vector>
using namespace std;

/**
 * Constructor for the Help command.
 * Needs a pointer to the manager to inspect other registered commands.
 */
HelpCommand::HelpCommand(CommandManager* m) {
    manager = m;
}

/**
 * Generates a list of all available commands and their required input structures.
 * Commands are printed in alphabetical order (as per map iteration).
 */
string HelpCommand::execute(const vector<int>& args) {
    if (!args.empty()) {
        return ("400 Bad Request");
    }
    auto registeredCommands = manager->getRegisteredCommands();
    string helpOutput = "";
    for (const auto& pair : registeredCommands) {
        string name = pair.first;
        // Skip 'help' to append it manually at the end of the list
        if(name == "HELP") continue;

        string structure = pair.second->getInputStructure();
        helpOutput += name + ", " + structure + "\n";
    }
    // Append the help command itself at the end
    return helpOutput + "HELP";
}