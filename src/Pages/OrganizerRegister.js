import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../PagesCSS/OrganizerRegisterCSS.css'; // 确保路径正确

const REST_API_URL = "https://localhost:7085/api/User/CreateOrganizer";

export default function OrganizerRegister() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    async function handleSignUpClick(e) {
        e.preventDefault();
        console.log("sign up button is clicked");
        try {
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const data = {
                "name": fullName,
                "email": email,
                "passwordHash": password,
                "role": "123"
            };
            const response = await axios.post(REST_API_URL, data);

            if (response.status === 201) {
                alert("Registration successful!");
                navigate('/login/organizer'); // Redirect to login page after successful registration
            } else if (response.status === 400) {
                alert(response.data.message); // Display message for 400 status
            } else {
                alert("UserName or Mail already exist");
            }
        } catch (error) {
            if (error.response) {
                // 请求已发出，但服务器响应的状态码不在 2xx 范围内
                alert(error.response.data || "UserName or EMail already exist");
            } else if (error.request) {
                // 请求已发出，但没有收到响应
                console.error('No response', error.request);
                alert("No response from server.");
            } else {
                // 在设置请求时触发了错误
                console.error('Error', error.message);
                alert("UserName or Mail already exist");
            }
            console.error(error);
        }
    }

    return (
        <div className="signup-wrapper">
            <div className="signup-card">
                <h4 className="mb-3">Seconds to sign up!</h4>

                <form>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3" onClick={handleSignUpClick}>
                        SignUp with UniSphere
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
            <button className="login-button" onClick={() => navigate('/')}>
                Login
            </button>
        </div>
    );
}