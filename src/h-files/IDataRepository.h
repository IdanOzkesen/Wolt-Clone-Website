#pragma once
#include <vector>
#include <map>

/**
 * Interface for Data Storage.
 * Decouples the business logic from the specific storage method (File, DB, etc.).
 */
class IDataRepository {
public:
    virtual ~IDataRepository() = default;

    // Persistence methods
    virtual void saveUserViews(const int& userId, const std::vector<int>& productIds) = 0;
    virtual void deleteUserViews(const int& userId, const std::vector<int>& productIds) = 0;

    // Retrieval methods (Returning references for efficiency)
    virtual const std::map<int, std::vector<int>>& getUserToProduct() = 0;
    virtual const std::map<int, std::vector<int>>& getProductToUser() = 0;
};