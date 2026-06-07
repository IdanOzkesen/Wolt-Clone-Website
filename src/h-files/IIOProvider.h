#pragma once
#include <string>

/**
 * Interface for Input/Output.
 * Provides an abstraction for communication (Sockets, Terminal, Files, etc.).
 */
class IIOProvider {
public:
    virtual ~IIOProvider() = default;

    // Reads a line of text from the source
    virtual std::string getLine() = 0;
    
    // Sends a line of text to the destination
    virtual void returnLine(const std::string& text) = 0;
};