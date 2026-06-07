#pragma once
#include <vector>
#include <string>

/**
 * Interface for the Command Pattern.
 * Defines the contract for all executable system commands.
 */
class ICommand {
public:
    virtual ~ICommand() = default;

    /**
     * Executes the specific logic of the command.
     * @param args A vector of validated integers representing command parameters.
     * @return A response string to be sent back to the client.
     */
    virtual std::string execute(const std::vector<int>& args) = 0;

    /**
     * Returns a string describing the expected input format for the 'help' command.
     */
    virtual std::string getInputStructure() const = 0;
};