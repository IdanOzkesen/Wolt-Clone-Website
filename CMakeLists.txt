cmake_minimum_required(VERSION 3.10)
project(ProductRecommender)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(GTest REQUIRED)
include_directories(src/h-files)

set(SOURCE_FILES
    src/cpp-files/app.cpp
    src/cpp-files/DELETECommand.cpp
    src/cpp-files/RecommendCommand.cpp 
    src/cpp-files/PATCHCommand.cpp
    src/cpp-files/POSTCommand.cpp
    src/cpp-files/HelpCommand.cpp
    src/cpp-files/RecommenderEngine.cpp
    src/cpp-files/FileDataRepository.cpp
    src/cpp-files/TcpServer.cpp
    src/cpp-files/CommandManager.cpp
    src/cpp-files/SocketIOProvider.cpp
)

add_executable(run_server src/cpp-files/main.cpp ${SOURCE_FILES})
target_link_libraries(run_server pthread)

file(WRITE ${CMAKE_BINARY_DIR}/run_client 
    "#!/bin/bash\n"
    "SCRIPT_DIR=$(dirname \"$0\")\n"
    "python3 \"$SCRIPT_DIR/../src/client.py\" \"$@\"\n"
)

execute_process(COMMAND chmod +x ${CMAKE_BINARY_DIR}/run_client)

# --- 2. Create the tests executable ---
# For tests, we replace main.cpp with test_main.cpp, but we still need the rest of the logic

add_executable(run_tests 
    tests/test_main.cpp 
    tests/test_POST.cpp
    tests/test_GET.cpp
    tests/test_PATCH.cpp
    tests/test_DELETE.cpp
    tests/test_HELP.cpp
    tests/test_TcpServer.cpp
    tests/test_SocketIOProvider.cpp
    tests/test_FileDataRepository.cpp
    tests/test_RecommendEngine.cpp
    tests/test_CommandManager.cpp
    ${SOURCE_FILES}
)

# Link Google Test and pthread to the test executable
target_link_libraries(run_tests GTest::gtest GTest::gtest_main pthread)