import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../ComponentsCSS/SideBarCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const fetchMessages = async () => {
        try {
            const res = await api.get("/getLoginUserMessage");
            const list = res.data || [];
            setMessages(list);
            setUnreadMessages(list.filter((m) => m.isRead === false).length);
        } catch (err) {
            console.error("fetchMessages error:", err?.response || err);
            // 未登录时该接口可能 401，这里不弹窗，交由登录检查处理
        }
    };

    const isActive = (path) => location.pathname === path;

    const checkLoginStatus = async () => {
        try {
            await api.get("/api/Login/check"); // 200 表示已登录
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401) {
                // 未登录跳转到登录页
                navigate("/");
                return;
            }
            console.error("checkLoginStatus error:", err?.response || err);
            alert("Not logged in");
            navigate("/");
        }
    };

    useEffect(() => {
        checkLoginStatus();
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isMyChannelsActive = () =>
        location.pathname === "/CreateChannel" ||
        location.pathname === "/ManageChannel" ||
        location.pathname === "/PublishPost" ||
        location.pathname === "/ViewChannelPost";

    return (
        <div className="sidebar">
            <div className="logo-container">
                <span className="logo-icon">s</span>
                <span className="logo-text">SaaS De...</span>
                <span className="logo-dropdown">▼</span>
            </div>

            <div className="nav-items">
                <Link to="/Dashboard" className={`nav-item ${isActive("/Dashboard") ? "active" : ""}`}>
                    <i className="nav-icon">📊</i>
                    <span className="nav-text">Dashboards</span>
                </Link>

                <Link to="/inbox" className={`nav-item ${isActive("/inbox") ? "active" : ""}`}>
                    <i className="nav-icon">✉️</i>
                    <span className="nav-text">Inbox</span>
                    <span className="icon-link">New: {unreadMessages}</span>
                </Link>

                <Link to="/CreateActivity" className={`nav-item ${isActive("/CreateActivity") ? "active" : ""}`}>
                    <i className="nav-icon">➕</i>
                    <span className="nav-text">Create Activity</span>
                </Link>

                <Link to="/ManageActivities" className={`nav-item ${isActive("/ManageActivities") ? "active" : ""}`}>
                    <i className="nav-icon">📺</i>
                    <span className="nav-text">Manage Activities</span>
                </Link>

                <Link to="/ReviewRequests" className={`nav-item ${isActive("/ReviewRequests") ? "active" : ""}`}>
                    <i className="nav-icon">📝</i>
                    <span className="nav-text">Review Requests</span>
                </Link>
            </div>

            <div className="channels-section">
                <div className="section-header">
                    <span>Channels ›</span>
                </div>

                <div className={`nav-item ${isMyChannelsActive() ? "active" : ""}`}>
                    <i className="nav-icon">💬</i>
                    <span className="nav-text">My Channels</span>
                    <span className="channel-actions">⋯</span>
                    <span className="add-channel">+</span>
                </div>

                <Link to="/CreateChannel" className={`nav-item ${isActive("/CreateChannel") ? "active" : ""}`}>
                    <i className="nav-icon">🔍</i>
                    <span className="nav-text">Create Channel</span>
                </Link>

                <Link to="/ManageChannel" className={`nav-item ${isActive("/ManageChannel") ? "active" : ""}`}>
                    <i className="nav-icon">⚙️</i>
                    <span className="nav-text">Manage Channel</span>
                </Link>

                <Link to="/PublishPost" className={`nav-item ${isActive("/PublishPost") ? "active" : ""}`}>
                    <i className="nav-icon">📤</i>
                    <span className="nav-text">Publish Post</span>
                    <span className="check-icon">✓</span>
                </Link>

                <Link to="/ViewChannelPost" className={`nav-item ${isActive("/ViewChannelPost") ? "active" : ""}`}>
                    <i className="nav-icon">📜</i>
                    <span className="nav-text">View Channel Post</span>
                </Link>
            </div>

            <div className="help-section">
                <Link to="/help" className={`help-item ${isActive("/help") ? "active" : ""}`}>
                    <i className="help-icon">❓</i>
                    <span className="help-text">Help</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
