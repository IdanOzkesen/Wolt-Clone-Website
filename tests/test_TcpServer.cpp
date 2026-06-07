#include <gtest/gtest.h>
#include "../h-files/TcpServer.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring> // For memset
#include <thread>
#include <chrono>

class DummyCommand : public ICommand {
private:
    std::string expectedStructure;
public:
    DummyCommand(const std::string& structure) : expectedStructure(structure) {}
    
    // Note: using std::vector<int> exactly as defined in your ICommand interface
    std::string execute(const std::vector<int>& args) override {
        return "200 Ok";
    }
    
    std::string getInputStructure() const override {
        return expectedStructure;
    }
};
// Test fixture class for TcpServer
// We test the network binding and listening capabilities without blocking the test execution.
class TcpServerTest : public ::testing::Test {
protected:
    TcpServer* server;
    CommandManager* manager;

    // We choose an arbitrary high port for testing to avoid conflicts with system services.
    const int testPort = 12345; 

    // SetUp() initializes the server object before each test
    void SetUp() override {
        manager = new CommandManager();
        server = new TcpServer(manager);
    }

    // TearDown() cleans up after each test
    void TearDown() override {
        // The destructor of TcpServer should close the listening socket cleanly
        delete server; 
        delete manager;

        // Add a small delay after teardown to ensure the OS fully releases the port 
        // before the next test runs, preventing "Address already in use" errors.
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
};

// Test 1: Verify that start() successfully binds to a port and the OS accepts connections
TEST_F(TcpServerTest, StartBindsAndListensSuccessfully) {
    // 1. Start the server (this should call socket(), bind(), and listen())
    server->start(testPort);

    // 2. Create a test client socket
    int clientSock = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_GE(clientSock, 0) << "Failed to create test client socket";

    // 3. Initialize the server's address structure (Classic approach)
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin)); // Initialize memory to zero to avoid garbage values
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = inet_addr("127.0.0.1"); // Connect to localhost
    sin.sin_port = htons(testPort);

    // Give the server a tiny fraction of a second to be fully ready before connecting
    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    // 4. Actively attempt to establish a TCP connection with the server
    // Note: We do NOT use send() or recv() here because the server's run() loop 
    // with accept() is not actively running in this specific test.
    int connect_res = connect(clientSock, (struct sockaddr *) &sin, sizeof(sin));
    
    // Verify the connection was successful (connect returns 0 on success)
    EXPECT_EQ(connect_res, 0) << "Client failed to connect to the server's listening port";

    // 5. Cleanly close the client socket
    close(clientSock);
}