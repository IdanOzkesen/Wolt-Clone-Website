#pragma once
#include <string>
#include "IIOProvider.h"
// SocketIOProvider class
// This class abstracts the communication with a specific client over a network socket,
// allowing the business logic to remain agnostic of the underlying transport layer.

class SocketIOProvider : public IIOProvider {
private:
    // The specific file descriptor for the connected client
    int clientSocket;
public:
    // Constructor: Associates the provider with an active client socket.
    SocketIOProvider(int socket);

    // Reads a single line of text from the socket Implementation should handle buffer management
    // and look for the '\n' delimiter.
    std::string getLine() override;
    
    // Sends a string of text followed by a newline back to the client.
    void returnLine(const std::string& text) override;
};