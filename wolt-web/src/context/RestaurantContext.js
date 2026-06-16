import React, { createContext, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { AuthContext } from './AuthContext';

export const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
    const [restaurants, setRestaurants] = useState([]);
    const { userData } = useContext(AuthContext);


    const addRestaurant = async (restaurantData) => {
        try {
            const payload = {
                name: restaurantData.name,
                address: restaurantData.address,
                category: restaurantData.category,
                phoneNum: restaurantData.phoneNum,
                photo: restaurantData.photo,
                ownerId: userData.userId
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
                        r.phoneNum === payload.phoneNum
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
            return { success: false, error: "Network error" };
        }
    };

    return (
        <RestaurantContext.Provider value={{ restaurants, setRestaurants, addRestaurant }}>
            {children}
        </RestaurantContext.Provider>
    );
}