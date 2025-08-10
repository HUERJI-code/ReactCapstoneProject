import React, { useState } from "react";
import axios from "axios";
import "../ComponentsCSS/AdminInviteCodesCSS.css"; // 引入独立 CSS

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default function AdminInviteCodes() {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        setCode("");

        try {
            const res = await api.get("/api/Login/getInviteCode");
            const value = res?.data?.code || "";
            if (!value) throw new Error("No code in response");
            setCode(value);
        } catch (e) {
            console.error("getInviteCode error:", e?.response || e);
            setError(
                e?.response?.data?.message ||
                e?.message ||
                "Failed to get invite code"
            );
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            alert("Copied!");
        } catch {
            alert("Copy failed. Please copy manually.");
        }
    };

    return (
        <div className="invite-page">
            <h2 className="invite-title">Invite Codes</h2>

            <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? "Generating..." : "Generate New Invite Code"}
            </button>

            {error && (
                <div className="error-text">
                    {error}
                </div>
            )}

            {code && (
                <div className="code-display">
                    <div className="code-box">{code}</div>
                    <button className="copy-btn" onClick={copyToClipboard}>
                        Copy
                    </button>
                </div>
            )}
        </div>
    );
}
