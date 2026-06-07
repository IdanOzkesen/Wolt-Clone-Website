#include <gtest/gtest.h>
#include "../src/h-files/CommandManager.h"
#include "../src/h-files/IIOProvider.h"
#include "../src/h-files/ICommand.h"
#include <queue>
#include <vector>
#include <string>
#include <memory>
#include <stdexcept> // Required for std::runtime_error

// =====================================================================
// Mocks for Testing CommandManager
// =====================================================================

// 1. Mock IO Provider: Simulates a user typing and reading responses
class MockIOProvider : public IIOProvider {
public:
    std::queue<std::string> inputs;
    std::vector<std::string> outputs;

    // Simulate reading a line from the client
    std::string getLine() override {
        if (inputs.empty()) {
            // Throw an exception to forcibly break the infinite while(true) loop 
            // inside CommandManager::handleClient once all inputs are processed.
            throw std::runtime_error("Simulated Disconnect"); 
        }
        std::string val = inputs.front();
        inputs.pop();
        return val;
    }

    // Simulate sending text back to the client
    void returnLine(const std::string& output) override {
        outputs.push_back(output);
    }
};

// 2. Mock Command: A fake command that just returns a fixed string
class MockCommand : public ICommand {
private:
    std::string expectedStructure;
    std::string returnValue;
public:
    MockCommand(std::string retVal) : returnValue(retVal), expectedStructure("args") {}
    
    std::string execute(const std::vector<int>& args) override {
        return returnValue;
    }
    
    std::string getInputStructure() const override {
        return expectedStructure;
    }
};

// =====================================================================
// Test Suite: CommandManager
// =====================================================================

class CommandManagerTest : public ::testing::Test {
protected:
    CommandManager* manager;
    MockIOProvider* mockIO;

    void SetUp() override {
        manager = new CommandManager();
        mockIO = new MockIOProvider();

        // Register fake commands so we only test the Manager's routing logic
        manager->registerCommand("POST", std::unique_ptr<ICommand>(new MockCommand("200 Ok")));
        manager->registerCommand("GET", std::unique_ptr<ICommand>(new MockCommand("101 102")));
    }

    void TearDown() override {
        delete manager;
        delete mockIO;
    }
};

// Test 1: Valid Command Routing
TEST_F(CommandManagerTest, RoutesValidCommandAndSendsResponse) {
    // Arrange: User types a valid command. 
    // No need for an empty string; the empty queue will trigger the exception.
    mockIO->inputs.push("POST 1 101 102");

    // Act & Assert: Tell the manager to handle the client, and expect it to eventually throw
    EXPECT_THROW({
        manager->handleClient(mockIO);
    }, std::runtime_error);

    // Assert: Check that before the disconnect, the expected output was recorded
    ASSERT_EQ(mockIO->outputs.size(), 1);
    EXPECT_EQ(mockIO->outputs[0], "200 Ok");
}

// Test 2: Invalid Command Handling
TEST_F(CommandManagerTest, ReturnsErrorForUnknownCommand) {
    // Arrange: User types gibberish
    mockIO->inputs.push("bamba 1 2 3");

    // Act & Assert: Catch the loop-breaking exception
    EXPECT_THROW({
        manager->handleClient(mockIO);
    }, std::runtime_error);

    // Assert: The manager should catch that "bamba" doesn't exist and return an error
    ASSERT_EQ(mockIO->outputs.size(), 1);
    
    // Note: Adjust "400 Bad Request" to whatever error string your CommandManager actually returns
    EXPECT_EQ(mockIO->outputs[0], "400 Bad Request"); 
}

// Test 3: Empty Input Handling
TEST_F(CommandManagerTest, HandlesEmptyInputGracefully) {
    // Arrange: User presses just Enter (spaces)
    mockIO->inputs.push("   ");

    // Act & Assert: Catch the loop-breaking exception
    EXPECT_THROW({
        manager->handleClient(mockIO);
    }, std::runtime_error);

    // Assert: Ensure it generated some error output instead of silently crashing
    ASSERT_FALSE(mockIO->outputs.empty());
}