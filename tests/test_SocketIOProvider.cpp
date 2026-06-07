#include <gtest/gtest.h>
#include "../src/h-files/SocketIOProvider.h"
#include <sys/socket.h>
#include <unistd.h>
#include <string>

// Test fixture class for SocketIOProvider
class SocketIOProviderTest : public ::testing::Test {
protected:
    // sv will hold our paired sockets. 
    // sv[0] is for the provider, sv[1] is our "fake network" for the test.
    int sv[2]; 
    SocketIOProvider* io;

    void SetUp() override {
        // Create a pair of connected sockets without any network routing overhead.
        // AF_UNIX is for local communication, SOCK_STREAM mimics TCP behavior.
        if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) == -1) {
            FAIL() << "Failed to create socketpair for testing";
        }
        
        // Initialize the provider with one end of the socket pair
        io = new SocketIOProvider(sv[0]);
    }

    void TearDown() override {
        delete io;
        // Close both ends of our local socket pair
        close(sv[0]);
        close(sv[1]);
    }
};

// Test 1: Verify standard single-line reading
TEST_F(SocketIOProviderTest, ReadsSingleLineCorrectly) {
    // 1. Act as the client: Send a proper command ending with a newline
    std::string msg = "GET 1 101";
    send(sv[1], msg.c_str(), msg.length(), 0);

    // 2. Act as the server: Call getLine()
    std::string result = io->getLine();
    
    // Note: Assuming your getLine() implementation strips the '\n' character 
    // before returning the string to the CommandManager.
    EXPECT_EQ(result, "GET 1 101");
}