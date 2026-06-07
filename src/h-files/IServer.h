#pragma once
#include <iostream>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
// IServer.h
// This interface defines a contract for a server that can be started on a specific port
// and run indefinitely to accept client connections. It includes a virtual destructor
// and two pure virtual functions: start and run

class IServer {
public:
    // Virtual destructor to ensure proper cleanup of derived classes
    virtual ~IServer() = default;
    
    // Pure virtual function to start the server on a specified port
    // This function takes an integer representing the server port and is responsible
    // for initializing the server socket and preparing it to accept client connections
    virtual void start(const int server_port) = 0;

    // Pure virtual function to run the server indefinitely
    // This function is responsible for accepting client connections and handling
    // them as needed. It should run in an infinite loop until the server is shut down
    virtual void run() = 0;
};