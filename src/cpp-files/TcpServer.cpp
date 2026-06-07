#include "../h-files/TcpServer.h"
#include "../h-files/SocketIOProvider.h"
#include <map>
#include <vector>
#include <stdexcept>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <algorithm>
using namespace std;

// Constructor: Initializes the server socket
// SOLID Check: The server no longer takes an IO provider. It only knows about the Manager.
TcpServer::TcpServer(CommandManager* cmdManager) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        throw runtime_error("Failed to create socket");
    }
    serverSocket = sock;
    manager = cmdManager;
}

// Initializes the server, binds it to the given port
void TcpServer::start(const int server_port) {
    listeningPort = server_port;
    
    // Set up the server address structure
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY; // Listen on all available interfaces
    sin.sin_port = htons(listeningPort); // Convert port to network byte order

    // Bind the socket to the IP and Port
    // We throw an exception if bind fails, so the program doesn't silently crash later
    if (::bind(serverSocket, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        close(serverSocket);
        throw runtime_error("Error binding socket to port"); 
    }

    if (listen(serverSocket, SOMAXCONN) < 0) {
        close(serverSocket);
        throw runtime_error("Error listening on socket");
    }
}

// The main server loop: accepts clients and handles communication
void TcpServer::run() {
    while(true) {
        struct sockaddr_in client_sin;
        unsigned int addr_len = sizeof(client_sin);
        // Accept a new connection
        int client_sock = accept(serverSocket, (struct sockaddr *) &client_sin, &addr_len);
        // If accept fails, skip to the next iteration
        if (client_sock < 0) {
            continue;
        }
        activeClientsSockets.push_back(client_sock);
        SocketIOProvider io(client_sock);
        manager->handleClient(&io);
        
        close(client_sock);
        
        // Safely remove the disconnected client from the tracking vector
        activeClientsSockets.erase(remove(activeClientsSockets.begin(), activeClientsSockets.end()
        , client_sock), activeClientsSockets.end()
        );
    }
    // Close the main listening socket
    close(serverSocket);
}

TcpServer::~TcpServer() {
    // Close all active client connections first
    // We want to tell the clients "the server is shutting down"
    for (int client_sock : activeClientsSockets) {
        if (client_sock >= 0) {
            // Optional: shutdown() sends a FIN packet, telling the client we're done
            // shutdown(client_sock, SHUT_RDWR); 
            close(client_sock);
        }
    }
    activeClientsSockets.clear();
    // Finally, close the main listening socket
    if (serverSocket >= 0) {
        close(serverSocket);
    }
}