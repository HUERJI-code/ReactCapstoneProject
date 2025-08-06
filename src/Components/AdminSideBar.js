import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import '../ComponentsCSS/SideBarCSS.css';
import axios from "axios";

export default function AdminSideBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const isActive = (path) => {
        return location.pathname === path;
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get('https://localhost:7085/getLoginUserMessage');
            setMessages(response.data);
            const unreadCount = response.data.filter(message => message.isRead === false).length;
            setUnreadMessages(unreadCount);
        } catch (err) {
            console.error(err);
        }
    };

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Login/check', {
                withCredentials: true
            });
            if (response.status === 401) {
                navigate("/OrganizerLogin");
            }
        } catch (err) {
            console.error(err);
            alert("Not logged in");
            navigate("/");
        }
    };

    useEffect(() => {
        checkLoginStatus();
        fetchMessages();
    }, []);
    return (
        <div className="sidebar">
            <div className="logo-container">
                <span className="logo-icon">s</span>
                <span className="logo-text">SaaS De...</span>
                <span className="logo-dropdown">▼</span>
            </div>
            <div className="nav-items">
                <Link to="/AdminDashboard" className={`nav-item ${isActive('/AdminDashboard') ? 'active' : ''}`}>
                    <i className="nav-icon">📊</i>
                    <span className="nav-text">Dashboards</span>
                </Link>
                <Link to="/AdminInbox" className={`nav-item ${isActive('/AdminInbox') ? 'active' : ''}`}>
                    <i className="nav-icon">✉️</i>
                    <span className="nav-text">Inbox</span>
                    <span className="icon-link">New: {unreadMessages}</span>
                </Link>
                <Link to="/ManageUserAccount" className={`nav-item ${isActive('/ManageUserAccount') ? 'active' : ''}`}>
                    <i className="nav-icon">👤</i>
                    <span className="nav-text">Manage User account</span>
                </Link>
            </div>
            <div className="channels-section">
                <Link to="/AdminManageActivities" className={`nav-item ${isActive('/AdminManageActivities') ? 'active' : ''}`}>
                    <i className="nav-icon">🎬</i>
                    <span className="nav-text">Manage Activities</span>
                </Link>
                <Link to="/AdminManageChannels" className={`nav-item ${isActive('/AdminManageChannels') ? 'active' : ''}`}>
                    <i className="nav-icon">📺</i>
                    <span className="nav-text">Manage Channel</span>
                </Link>
                <Link to="/ManageTags" className={`nav-item ${isActive('/ManageTags') ? 'active' : ''}`}>
                    <i className="nav-icon">🏷️</i>
                    <span className="nav-text">Tag Management</span>
                </Link>
            </div>
            {/*<div className="help-section">*/}
            {/*    <Link to="/help" className={`help-item ${isActive('/help') ? 'active' : ''}`}>*/}
            {/*        <i className="help-icon">❓</i>*/}
            {/*        <span className="help-text">Help</span>*/}
            {/*    </Link>*/}
            {/*</div>*/}
        </div>
    );
}