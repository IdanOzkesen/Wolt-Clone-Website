#pragma once
#include "IDataRepository.h"
#include <string>
#include <map>
#include <vector>

/**
 * Concrete implementation of IDataRepository using local text files.
 */
class FileDataRepository : public IDataRepository {
private:
    std::string dataPath;

    // In-memory cache for fast lookups
    std::map<int, std::vector<int>> userToProduct;
    std::map<int, std::vector<int>> productToUser;

public:
    FileDataRepository(const std::string& path);

    void saveUserViews(const int& userId, const std::vector<int>& productIds) override;
    void deleteUserViews(const int& userId, const std::vector<int>& productIds) override;

    const std::map<int, std::vector<int>>& getUserToProduct() override;
    const std::map<int, std::vector<int>>& getProductToUser() override;

    /**
     * Populates the in-memory maps from the specified file.
     */
    void loadAllDataFromeFile(const std::string& path);
};