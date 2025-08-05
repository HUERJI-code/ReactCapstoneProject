import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../PagesCSS/AdminLoginCSS.css'; // 确保路径正确

const REST_API_URL = "https://localhost:7085/api/Login/login";

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    async function handleLoginClick(e) {
        e.preventDefault();
        console.log("login button is clicked");
        try {
            const data = {
                "identifier": email,
                "passwordHash": password,
            };
            const response = await axios.post(REST_API_URL, data, {
                withCredentials: true
            });

            if (response.status === 200) {
                await checkLoginUserType();
            }
        } catch (error) {
            alert("Login failed. Please check your credentials!");
            console.error(error);
        }
    }

    async function checkLoginUserType() {
        try {
            const response = await axios.get("https://localhost:7085/checkLoginUserType");
            if (response.status === 200) {
                if (response.data.userType === "admin") {
                    alert("Admin Login successfully!");
                    navigate("/AdminDashboard");
                } else {
                    alert("Login failed. Your account is not authorized as an admin.");
                }
            }
        } catch (error) {
            console.error("Failed to fetch user type:", error);
        }
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h4 className="mb-3">Admin Login</h4>

                <form>
                    <div className="mb-3">
                        <label className="form-label">Work Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="example@site.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Choose Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3" onClick={handleLoginClick}>
                        Login
                    </button>
                </form>

                <div className="divider">or</div>

                <button className="btn btn-outline-dark w-100 mb-2">
                    <img
                        src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                        alt="Google"
                        width="20"
                        height="20"
                        className="me-2"
                    />
                    Continue with Google
                </button>

                <p className="tos">
                    By clicking the button above, you agree to our{' '}
                    <a href="/terms">Terms of Service</a> and{' '}
                    <a href="/privacy">Privacy Policy</a>
                </p>

                <div className="text-center mt-3">
                    <a href="/help" className="text-muted">
                        Help
                    </a>
                </div>
            </div>
        </div>
    );
}