import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../PagesCSS/OrganizerRegisterCSS.css";

// ===== 后端地址 =====
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default function OrganizerRegister() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");

    const navigate = useNavigate();

    async function handleSignUpClick(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!inviteCode.trim()) {
            alert("Please enter invite code.");
            return;
        }

        try {
            // 1) 调用后端使用邀请码
            const inviteRes = await api.get(`/api/Login/useInviteCode`, {
                params: { code: inviteCode.trim() },
                responseType: "text",
                transformResponse: [(data) => data],
                validateStatus: () => true, // 不让 axios 自动抛错，自己判断状态码
            });

            if (inviteRes.status !== 200) {
                // 邀码失败
                const errMsg =
                    typeof inviteRes.data === "string"
                        ? inviteRes.data
                        : "Invite code invalid";
                alert(errMsg);
                return;
            }

            // 2) 成功则调用注册接口
            const data = {
                name: fullName,
                email,
                passwordHash: password,
                role: "123",
            };

            const res = await api.post("/api/User/CreateOrganizer", data);

            if (res.status === 201) {
                alert("Registration successful!");
                navigate("/");
            } else {
                alert(res.data?.message || "Registration failed.");
            }
        } catch (error) {
            if (error?.response) {
                const msg =
                    typeof error.response.data === "string"
                        ? error.response.data
                        : error.response.data?.message || "Request failed.";
                alert(msg);
            } else {
                alert("Network error.");
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

                    <div className="mb-3">
                        <label className="form-label">Invite Code</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Invite Code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mb-3"
                        onClick={handleSignUpClick}
                    >
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

            <button className="login-button" onClick={() => navigate("/")}>
                Login
            </button>
        </div>
    );
}
