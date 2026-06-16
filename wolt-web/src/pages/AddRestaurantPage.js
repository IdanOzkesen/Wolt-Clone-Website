import React, { useContext } from 'react';
//import { RestaurantContext } from '../context/RestaurantContext';
import { useNavigate } from 'react-router-dom';
import DynamicForm from '../components/DynamicForm';

function AddRestaurantPage() {
    //const { addRestaurant } = useContext(RestaurantContext);
    const navigate = useNavigate();

    const fields = [
        { name: 'name', label: 'Restaurant Name', placeholder: 'Enter Restaurant Name', required: true },
        { name: 'address', label: 'Address', placeholder: 'Enter Address', required: true },
        { name: 'category', label: 'Category', placeholder: 'Enter Category', required: true },
        { name: 'phoneNum', label: 'Phone Number', placeholder: 'Enter Phone Number', required: true },
        { name: 'profilePhoto', label: 'Restaurant Photo', type: 'file', required: false }
    ];

    const handleSubmit = async (formData) => {
        // הכנה של נתוני ה-FormData
        const dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            dataToSend.append(key, value);
        });

        /*const result = await addRestaurant(dataToSend);
    
        if (result.success) {
          navigate(`/restaurant/${result.data.id}`);
        } else {
          alert(result.error);
        }*/
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