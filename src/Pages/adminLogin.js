import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../PagesCSS/AdminLoginCSS.css";

// ===== 后端地址（云端域名；本地联调就改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLoginClick(e) {
        e.preventDefault();
        try {
            const body = {
                identifier: email,
                passwordHash: password,
            };

            // 登录
            const res = await api.post("/api/Login/login", body);
            if (res.status === 200) {
                await checkLoginUserType();
            }
        } catch (err) {
            console.error("Login failed:", err?.response || err);
            alert("Login failed. Please check your credentials!");
        }
    }

    async function checkLoginUserType() {
        try {
            // 登录后检查角色
            const res = await api.get("/checkLoginUserType");
            if (res.status === 200) {
                if (res.data?.userType === "admin") {
                    alert("Admin Login successfully!");
                    navigate("/AdminInbox");
                } else {
                    alert("Login failed. Your account is not authorized as an admin.");
                }
            }
        } catch (err) {
            console.error("Failed to fetch user type:", err?.response || err);
            alert("Failed to verify user type.");
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

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleLoginClick}
                    >
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
                    By clicking the button above, you agree to our{" "}
                    <a href="/terms">Terms of Service</a> and{" "}
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
