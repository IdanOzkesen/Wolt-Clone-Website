import { useNavigate} from "react-router-dom";
import {useEffect} from "react";

function NotFoundPage() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/');
    }, [navigate]);
    return null;
}

export default NotFoundPage;