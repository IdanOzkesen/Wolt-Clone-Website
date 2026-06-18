import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";
import errorImg from "../assets/error-404.png";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <img 
                    src={errorImg} 
                    alt="404 Are You Lost?" 
                    className="not-found-img" 
                />
                
                <button 
                    className="back-home-btn" 
                    onClick={() => navigate('/', { replace: true })}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage;