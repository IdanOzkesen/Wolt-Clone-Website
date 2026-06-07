#pragma once
#include <vector>
#include "IServer.h"
#include "IIOProvider.h"
#include "CommandManager.h"
// TcpServer.h
// This class handles the low-level TCP networking logic using BSD sockets

class TcpServer : public IServer {
    private:
        // CommandManager instance for parsing user input and executing commands
        CommandManager* manager;
        // The main file descriptor used to listen for incoming connections
        int serverSocket;

        // The port number the server is bound to
        int listeningPort;

        // vector manage connected client sockets (for future-proofing/concurrency)
        std::vector<int> activeClientsSockets;

    public:
        // Constructor: Initializes the server object and sets default values for the socket descriptors.
        TcpServer(CommandManager* cmdManager);
        
        // Initializes the server: creates the socket, binds it to the specified port,
        // and starts listening. server_port The port number passed from main.
        void start(const int server_port) override;

        // The main server loop: accepts new client connections and handles
        // the communication logic.
        void run() override;

        // Destructor: Ensures all open sockets are closed and memory is freed.
        virtual ~TcpServer();
};