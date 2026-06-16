import React, { useContext, useEffect } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';
import { useNavigate } from 'react-router-dom';
import DynamicForm from '../components/DynamicForm';
import { AuthContext } from "../context/AuthContext";



function AddRestaurantPage() {
    const { addRestaurant } = useContext(RestaurantContext);
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext);


    const fields = [
        { name: 'name', label: 'Restaurant Name', placeholder: 'Enter Restaurant Name', required: true },
        { name: 'address', label: 'Address', placeholder: 'Enter Address', required: true },
        { name: 'category', label: 'Category', placeholder: 'Enter Category', required: true },
        { name: 'phoneNum', label: 'Phone Number', placeholder: 'Enter Phone Number', required: true },
        { name: 'photo', label: 'Restaurant Photo', type: 'file', required: false }
    ];

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { replace: true });
    }
  }, [navigate]);

    const handleSubmit = async (formData) => {
        const result = await addRestaurant(formData);

        if (result.success) {
            navigate(`/restaurant/${result.data.id}`, { replace: true });
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="add-page">
            <h1>Create New Restaurant</h1>
            <DynamicForm
                title="Add New Restaurant"
                fields={fields}
                onSubmit={handleSubmit}
                submitLabel="Save Restaurant"
            />
        </div>
    );
}
export default AddRestaurantPage;