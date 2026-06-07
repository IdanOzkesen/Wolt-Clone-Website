<<<<<<< HEAD
import {Navigate} from "react-router-dom";

function NotFoundPage() {
    return <Navigate to='/' />
=======
import { useNavigate} from "react-router-dom";
import {useEffect} from "react";

function NotFoundPage() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/');
    }, [navigate]);
    return null;
>>>>>>> AAA-99-Implement-Protected-Routes-Logic
}

export default NotFoundPage;