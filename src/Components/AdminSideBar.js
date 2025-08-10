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

export default function AdminSideBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [username, setUsername] = useState(""); // 新增：保存完整用户名

    const isActive = (path) => location.pathname === path;

    const fetchMessages = async () => {
        try {
            const res = await api.get("/getLoginUserMessage");
            const list = res.data || [];
            setMessages(list);
            setUnreadMessages(list.filter((m) => m.isRead === false).length);
        } catch (err) {
            console.error("fetchMessages error:", err?.response || err);
            // 未登录时可能 401，这里不弹窗
        }
    };

    const checkLoginStatus = async () => {
        try {
            const res = await api.get("/api/Login/check"); // 200 即已登录
            if (res.data?.username) {
                setUsername(res.data.username); // 保存用户名
            }
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401) {
                navigate("/adminLogin");
                return;
            }
            console.error("checkLoginStatus error:", err?.response || err);
            alert("Not logged in");
            navigate("/adminLogin");
        }
    };

    useEffect(() => {
        checkLoginStatus();
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="sidebar">
            <div className="logo-container">
        <span className="logo-icon">
          {username ? username.charAt(0).toUpperCase() : "?"}
        </span>
                <span className="logo-text">
          {username || "Loading..."}
        </span>
                <span className="logo-dropdown">▼</span>
            </div>

            <div className="nav-items">
                <Link to="/AdminDashboard" className={`nav-item ${isActive("/AdminDashboard") ? "active" : ""}`}>
                    <i className="nav-icon">📊</i>
                    <span className="nav-text">Dashboards</span>
                </Link>

                <Link to="/AdminInbox" className={`nav-item ${isActive("/AdminInbox") ? "active" : ""}`}>
                    <i className="nav-icon">✉️</i>
                    <span className="nav-text">Inbox</span>
                    <span className="icon-link">New: {unreadMessages}</span>
                </Link>

                <Link to="/ManageUserAccount" className={`nav-item ${isActive("/ManageUserAccount") ? "active" : ""}`}>
                    <i className="nav-icon">👤</i>
                    <span className="nav-text">Manage User account</span>
                </Link>
            </div>

            <div className="channels-section">
                <Link to="/AdminManageActivities" className={`nav-item ${isActive("/AdminManageActivities") ? "active" : ""}`}>
                    <i className="nav-icon">🎬</i>
                    <span className="nav-text">Manage Activities</span>
                </Link>

                <Link to="/AdminManageChannels" className={`nav-item ${isActive("/AdminManageChannels") ? "active" : ""}`}>
                    <i className="nav-icon">📺</i>
                    <span className="nav-text">Manage Channel</span>
                </Link>

                <Link to="/ManageTags" className={`nav-item ${isActive("/ManageTags") ? "active" : ""}`}>
                    <i className="nav-icon">🏷️</i>
                    <span className="nav-text">Tag Management</span>
                </Link>

                <Link
                    to="/AdminManageActivityRequests"
                    className={`nav-item ${isActive("/AdminManageActivityRequests") ? "active" : ""}`}
                >
                    <i className="nav-icon">📥</i>
                    <span className="nav-text">Manage Activity Requests</span>
                </Link>

                <Link
                    to="/ManageChannelRequests"
                    className={`nav-item ${isActive("/ManageChannelRequests") ? "active" : ""}`}
                >
                    <i className="nav-icon">🚩</i>
                    <span className="nav-text">Manage Channel Requests</span>
                </Link>

                <Link
                    to="/ManageChannelCreateRequest"
                    className={`nav-item ${isActive("/ManageChannelCreateRequest") ? "active" : ""}`}
                >
                    <i className="nav-icon">📝</i>
                    <span className="nav-text">Manage Channel Create Requests</span>
                </Link>
            </div>
        </div>
    );
}
