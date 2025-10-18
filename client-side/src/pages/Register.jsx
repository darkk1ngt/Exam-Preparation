import {Link, Navigate, useNavigate} from "react-router-dom";
import React, {useState, useEffect} from "react";
import {useAuth} from "../contexts/AuthContext";

function Register(props) {
    const {setMessage} = props;
    const navigate = useNavigate();
    const {checkAuthStatus} = useAuth();
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: event.target.email.value,
                password: event.target.password.value
            })
        });
        const data = await response.json();
        console.log(data);

        if(data.success){
            setMessage("Successfully registered.", "success");
            setTimeout(async () => {
                const response = await fetch("/api/login",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: event.target.email.value,
                        password: event.target.password.value,
                    }),
                });
                const data2 = await response.json();

                if (response.ok){
                    setMessage(data2.message, "success");
                    await checkAuthStatus();
                    navigate("/");
                }else{
                    setMessage(data2.message, "error");
                }
            }, 1000);
        }else{setMessage(data.message || "Registration failed", "error");
        }
    };
    return(
        <div className="auth-container">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join us today</p>
                <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id = "email"
                            name="email"
                            required
                            placeholder="Enter your email"
                            autoComplete="off"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Enter your password"
                            autoComplete="off"
                        />
                    </div>
                    <button type="submit" className="auth-button">
                        Create Account
                    </button>
                </form>
                <div className="auth-links">
                    <Link to="/login" className="auth-link">
                    Already have an account? <span>Sign in here</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;