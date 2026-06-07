#include "../h-files/StandardIOProvider.h"
#include <iostream>
#include <fstream>
#include <string>
using namespace std;
// StandardIOProvider.cpp
// Implementation of the StandardIOProvider class, which provides standard input and output functionality

// Override of the getLine function to read a line of input from the standard input
string StandardIOProvider::getLine() {
    string line;
    getline(cin, line);
    return(line);
}

// Override of the print function to print a line of output to the standard output
void StandardIOProvider::returnLine(const std::string& text) {
    cout << text << endl;
}