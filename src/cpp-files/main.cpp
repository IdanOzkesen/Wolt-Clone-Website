#include "../h-files/app.h"
using namespace std;
// main.cpp
// Entry point of the application, which creates an instance of the app class and runs it.
int main(int argc, char* argv[]) {
    if (argc != 2) {
        return -1;
    }
    app application;
    try
    {
        int port = stoi(argv[1]);
        while (true) {
            application.run(port);
        }
    }
    catch(const exception& e)
    {
        return(-1);
    }
    return(0);
}