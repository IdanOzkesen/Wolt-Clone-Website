#include "../h-files/FileDataRepository.h"
#include <sstream>
#include <fstream>
#include <filesystem>
#include <algorithm>

using namespace std;

/**
 * File-based implementation of the Data Repository.
 * Manages dual maps (User->Products and Product->Users) and persists them to disk.
 */
FileDataRepository::FileDataRepository(const string& filename) {
    dataPath = filename;
    filesystem::path filePath(dataPath);
    filesystem::path dir(filePath.parent_path());
    
    // Ensure the data directory exists on startup
    if (!filesystem::exists(dir) && !dir.empty()) {
        filesystem::create_directories(dir); 
    }
    
    // Load existing data from file into memory to synchronize maps
    loadAllDataFromeFile(dataPath);
}

/**
 * Persists new user views. Only writes unique new entries to the file (Append mode).
 */
void FileDataRepository::saveUserViews (const int& userId, const vector<int>& productIds) {
    auto& userProducts = userToProduct[userId];
    vector<int> actuallyAdded;

    for (const auto& newId : productIds) {
        // Prevent duplicate views for the same user
        if (find(userProducts.begin(), userProducts.end(), newId) == userProducts.end()) {
            userToProduct[userId].push_back(newId);
            productToUser[newId].push_back(userId);
            actuallyAdded.push_back(newId);
        }
    }

    if (actuallyAdded.empty()) return; 

    ofstream datafil(dataPath, ios::app); 
    if (!datafil.is_open()) return;

    // Append only the newly added views to the file
    datafil << userId << ":";
    for(const auto& productId : actuallyAdded) {
        datafil << productId << ",";
    }
    datafil << endl;
}

/**
 * Deletes specific views. Requires rewriting the whole file to reflect deletions.
 */
void FileDataRepository::deleteUserViews (const int& userId, const vector<int>& productIds) {
    auto& userProducts = userToProduct[userId];
    
    for (int id : productIds) {
        // Remove from memory maps
        userProducts.erase(remove(userProducts.begin(), userProducts.end(), id), userProducts.end());
        auto& productUsers = productToUser[id];
        productUsers.erase(remove(productUsers.begin(), productUsers.end(), userId), productUsers.end());
    }

    // Overwrite the file with the updated memory state
    ofstream datafil(dataPath); 
    if (!datafil.is_open()) return;

    for (const auto& pair : userToProduct) {
        datafil << pair.first << ":";
        for (const auto& pid : pair.second) {
            datafil << pid << ",";
        }
        datafil << endl;
    }
}

const map<int, vector<int>>& FileDataRepository::getUserToProduct() {
    return userToProduct;
}

const map<int, vector<int>>& FileDataRepository::getProductToUser() {
    return productToUser;
}

/**
 * Loads the repository state from the text file.
 * Format: userId:productId1,productId2,...
 */
void FileDataRepository::loadAllDataFromeFile(const string& filename){
    ifstream datafil(dataPath);
    if (!datafil.is_open()) return;

    string line, stringUserId, stringProductId;
    while(getline(datafil, line)) {
        if (line.empty()) continue;
        
        stringstream ss(line);
        if (getline(ss, stringUserId, ':')) {
            int userId = stoi(stringUserId);
            while (getline(ss, stringProductId, ',')) {
                if (stringProductId.empty()) continue;
                
                int productId = stoi(stringProductId);
                auto& userProducts = userToProduct[userId];
                
                // Consistency check while loading
                if (find(userProducts.begin(), userProducts.end(), productId) == userProducts.end()) {
                    userToProduct[userId].push_back(productId);
                    productToUser[productId].push_back(userId);
                }
            }
        }
    }
}