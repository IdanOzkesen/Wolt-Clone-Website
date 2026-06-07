#include "../h-files/SocketIOProvider.h"
#include <string>
#include <sys/socket.h>
#include <unistd.h>
#include <cstring>

using namespace std;

/**
 * Concrete implementation of IIOProvider for TCP Networking.
 */
SocketIOProvider::SocketIOProvider(int socket) {
    clientSocket = socket;
}

/**
 * Reads data from the socket.
 * Currently reads the whole buffer at once. 
 */
string SocketIOProvider::getLine() {
    char buffer[4096];
    int read_bytes = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    
    if (read_bytes <= 0) {
        throw(read_bytes); // Signal connection closure or error
    }
    
    buffer[read_bytes] = '\0';
    return string(buffer);
}
    
/**
 * Ensures all bytes are sent, even if 'send' is partial.
 */
void SocketIOProvider::returnLine(const string& text) {
    size_t total_sent = 0;
    size_t length = text.size();
    const char* data = text.c_str();

    while (total_sent < length) {
        ssize_t sent = send(clientSocket, data + total_sent, length - total_sent, 0);
        if (sent < 0) throw (int)sent;
        total_sent += sent;
    }
}