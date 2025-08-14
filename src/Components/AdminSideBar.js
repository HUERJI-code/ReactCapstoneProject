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
    const [username, setUsername] = useState("");
    const [guardChecking, setGuardChecking] = useState(true); // 正在检查权限

    const isActive = (path) => location.pathname === path;

    const fetchMessages = async () => {
        try {
            const res = await api.get("/getLoginUserMessage");
            const list = res.data || [];
            setMessages(list);
            setUnreadMessages(list.filter((m) => m.isRead === false).length);
        } catch (err) {
            console.error("fetchMessages error:", err?.response || err);
        }
    };

    const checkLoginStatus = async () => {
        try {
            const res = await api.get("/api/Login/check"); // 200 即已登录
            if (res.data?.username) {
                setUsername(res.data.username);
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

    // 检查是否 admin
    const checkUserType = async () => {
        try {
            const res = await api.get("/checkLoginUserType");
            if (!res?.data?.userType || res.data.userType.toLowerCase() !== "admin") {
                alert("login user type is not admin")
                navigate("/", { replace: true });
                return false;
            }
            return true;
        } catch (err) {
            console.error("checkUserType error:", err?.response || err);
            navigate("/", { replace: true });
            return false;
        } finally {
            setGuardChecking(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const ok = await checkUserType();
            if (!ok) return; // 不是 admin 直接返回
            await checkLoginStatus();
            await fetchMessages();
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (guardChecking) {
        return (
            <div className="sidebar">
                <div className="logo-container">
                    <span className="logo-icon">?</span>
                    <span className="logo-text">Checking access...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <div className="logo-container">
                <span className="logo-icon">
                    {username ? username.charAt(0).toUpperCase() : "?"}
                </span>
                <span className="logo-text">{username || "Loading..."}</span>
                <span className="logo-dropdown">▼</span>
            </div>

            <div className="nav-items">
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

                <Link to="/AdminManageActivityRequests" className={`nav-item ${isActive("/AdminManageActivityRequests") ? "active" : ""}`}>
                    <i className="nav-icon">📥</i>
                    <span className="nav-text">Manage Activity Requests</span>
                </Link>

                <Link to="/ManageChannelRequests" className={`nav-item ${isActive("/ManageChannelRequests") ? "active" : ""}`}>
                    <i className="nav-icon">🚩</i>
                    <span className="nav-text">Manage Channel Report</span>
                </Link>

                <Link to="/ManageChannelCreateRequest" className={`nav-item ${isActive("/ManageChannelCreateRequest") ? "active" : ""}`}>
                    <i className="nav-icon">📝</i>
                    <span className="nav-text">Manage Channel Requests</span>
                </Link>

                <Link to="/AdminInviteCodes" className={`nav-item ${isActive("/AdminInviteCodes") ? "active" : ""}`}>
                    <i className="nav-icon">🔑</i>
                    <span className="nav-text">Generate Invite Codes</span>
                </Link>
            </div>
        </div>
    );
}
