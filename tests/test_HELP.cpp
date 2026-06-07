#include <gtest/gtest.h>
#include "../src/h-files/HelpCommand.h"
#include "../src/h-files/CommandManager.h"
#include "../src/h-files/IIOProvider.h"
#include "../src/h-files/ICommand.h"
#include <vector>
#include <string>
#include <memory> // For std::unique_ptr

// Dummy Command to populate the CommandManager without needing real dependencies 
// like the database or the recommendation engine.
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

// 3. Test fixture class for HelpCommand
class HelpCommandTest : public ::testing::Test {
protected:
    CommandManager* manager;

    // SetUp() initializes the dependency chain and registers the commands
    void SetUp() override {
        manager = new CommandManager();
        
        // Registering dummy commands using std::unique_ptr to match CommandManager.h
        manager->registerCommand("GET", std::unique_ptr<ICommand>(new DummyCommand("arguments: [userid] [productid]")));
        manager->registerCommand("POST", std::unique_ptr<ICommand>(new DummyCommand("arguments: [userid] [productid1] [productid2] ...")));
        manager->registerCommand("PATCH", std::unique_ptr<ICommand>(new DummyCommand("arguments: [userid] [productid1] [productid2] ...")));
        manager->registerCommand("DELETE", std::unique_ptr<ICommand>(new DummyCommand("arguments: [userid] [productid1] [productid2] ...")));
        
        // Registering the help command itself so it shows up in its own output list
        manager->registerCommand("HELP", std::unique_ptr<ICommand>(new DummyCommand("")));
    }
    
    // TearDown() cleans up the allocated memory
    void TearDown() override {
        delete manager;
    }
};

// Test 1: Verify alphabetical order, 'help' at the end, and correct argument structures
TEST_F(HelpCommandTest, VerifyAlphabeticalOrderAndArguments) {
    // Initialize HelpCommand with the manager we just populated
    HelpCommand cmd(manager); 
    
    std::vector<int> args = {}; 
    
    // Execute the help command
    std::string result = cmd.execute(args);
    // Construct the exact expected string.
    // The std::map inside CommandManager automatically sorts keys alphabetically,
    // and 'h' (lowercase) comes after uppercase letters in ASCII, so 'help' is naturally last.
    std::string expected = 
        "DELETE, arguments: [userid] [productid1] [productid2] ...\n"
        "GET, arguments: [userid] [productid]\n"
        "PATCH, arguments: [userid] [productid1] [productid2] ...\n"
        "POST, arguments: [userid] [productid1] [productid2] ...\n"
        "HELP";
    EXPECT_EQ(result, expected);
}

TEST_F(HelpCommandTest, HelpCommandHasNoInputStructure) {
    HelpCommand cmd(manager);
    std::vector<int> args = {1};
    std::string result = cmd.execute(args);
    EXPECT_EQ(result, "400 Bad Request"); // The help command should return its own help text
}