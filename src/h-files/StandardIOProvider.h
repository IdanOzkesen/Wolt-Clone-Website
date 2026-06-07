#pragma once
#include <string>
#include "IIOProvider.h"
// StandardIOProvider class
// This class implements the IIOProvider interface and provides functionality to get input from
// the standard input and print output to the standard output.

class StandardIOProvider : public IIOProvider {
public:

    // Override of the getLine function to read a line of input from the standard input
    std::string getLine() override;
    
    // Override of the print function to print a line of output to the standard output
    void returnLine(const std::string& text) override;
};