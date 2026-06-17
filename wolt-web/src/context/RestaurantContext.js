import React, { createContext, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { AuthContext } from './AuthContext';

export const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
    const [restaurants, setRestaurants] = useState([]);
    
    // Extract user data from AuthContext
    const { userData } = useContext(AuthContext);

    const addRestaurant = async (restaurantData) => {
        try {
            // Safely extract the ID whether it is saved as 'userId' or 'id' in your context
            const currentOwnerId = userData?.userId || userData?.id;

            // Prevent sending a faulty request to the server if the user ID is entirely missing
            if (!currentOwnerId) {
                console.error("Auth Error: userData is missing the ID.", userData);
                return { success: false, error: 'User authentication error: Missing owner ID.' };
            }

            // Build the payload exactly as the server expects it
            const payload = {
                name: restaurantData.name,
                address: restaurantData.address,
                category: restaurantData.category,
                phoneNum: restaurantData.phoneNum,
                imageUrl: restaurantData.imageUrl,
                ownerId: currentOwnerId // Injected safely
            };

            const response = await apiFetch('/restaurants', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Failed to create restaurant' };
            }

            const location = response.headers.get('Location');
            let id = location?.split('/').pop();

            if (!id) {
                const listResponse = await apiFetch('/restaurants');
                const allRestaurants = await listResponse.json();
                const created = allRestaurants.find(
                    (r) =>
                        r.name === payload.name &&
                        r.address === payload.address &&
                        r.category === payload.category &&
                        r.phoneNum === payload.phoneNum &&
                        r.imageUrl === payload.imageUrl
                );
                id = created?.id;
            }

            if (!id) {
                return { success: false, error: 'Invalid server response' };
            }

            const newRestaurant = { id, ...payload };
            setRestaurants(prev => [...prev, newRestaurant]);

            return { success: true, data: newRestaurant };
        } catch (err) {
            console.error("Catch block error:", err);
            return { success: false, error: "Network error" };
        }
    };

    return (
        <RestaurantContext.Provider value={{ restaurants, setRestaurants, addRestaurant }}>
            {children}
        </RestaurantContext.Provider>
    );
}