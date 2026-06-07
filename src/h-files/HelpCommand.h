#pragma once
#include "ICommand.h"
#include "IIOProvider.h"
#include "CommandManager.h"
#include <vector>
#include <string>
// HelpCommand class
// This class implements the ICommand interface and is responsible for executing the "help"

class HelpCommand : public ICommand {
private:
    CommandManager* manager;

public:

    // Constructor that takes an IIOProvider pointer for input/output operations
    HelpCommand(CommandManager* m);

    // Override of the execute function from the ICommand interface to provide help information
    std::string execute(const std::vector<int>& args) override;

    // Override of the getInputStructure function from the ICommand interface to provide
    // information about the expected input format for this command
    std::string getInputStructure() const override {
        return "";
    }
};