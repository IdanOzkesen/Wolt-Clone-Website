import React, { createContext, useState } from 'react';
import { apiFetch } from '../services/api';

export const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
    const [restaurants, setRestaurants] = useState([]);


    const addRestaurant = async (formData) => {
        try {
            const response = await apiFetch('/restaurants', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.error };
            }

            const newRestaurant = await response.json();

            setRestaurants(prev => [...prev, newRestaurant]);

            return { success: true, data: newRestaurant };
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

    return (
        <RestaurantContext.Provider value={{ restaurants, setRestaurants, addRestaurant }}>
            {children}
        </RestaurantContext.Provider>
    );
}