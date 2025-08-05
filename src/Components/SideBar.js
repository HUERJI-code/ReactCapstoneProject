import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../ComponentsCSS/SideBarCSS.css';
import axios from "axios";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);

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

    const isActive = (path) => {
        return location.pathname === path;
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

    const isMyChannelsActive = () => {
        return (
            location.pathname === '/CreateChannel' ||
            location.pathname === '/ManageChannel' ||
            location.pathname === '/PublishPost' ||
            location.pathname === '/ViewChannelPost' // 添加新页面的路径检查
        );
    };

    return (
        <div className="sidebar">
            <div className="logo-container">
                <span className="logo-icon">s</span>
                <span className="logo-text">SaaS De...</span>
                <span className="logo-dropdown">▼</span>
            </div>
            <div className="nav-items">
                <Link to="/Dashboard" className={`nav-item ${isActive('/Dashboard') ? 'active' : ''}`}>
                    <i className="nav-icon">📊</i>
                    <span className="nav-text">Dashboards</span>
                </Link>
                <Link to="/inbox" className={`nav-item ${isActive('/inbox') ? 'active' : ''}`}>
                    <i className="nav-icon">✉️</i>
                    <span className="nav-text">Inbox</span>
                    <span className="icon-link">New: {unreadMessages}</span>
                </Link>
                <Link to="/CreateActivity" className={`nav-item ${isActive('/CreateActivity') ? 'active' : ''}`}>
                    <i className="nav-icon">➕</i>
                    <span className="nav-text">Create Activity</span>
                </Link>
                <Link to="/ManageActivities" className={`nav-item ${isActive('/ManageActivities') ? 'active' : ''}`}>
                    <i className="nav-icon">📺</i>
                    <span className="nav-text">Manage Activities</span>
                </Link>
                <Link to="/ReviewRequests" className={`nav-item ${isActive('/ReviewRequests') ? 'active' : ''}`}>
                    <i className="nav-icon">📝</i>
                    <span className="nav-text">Review Requests</span>
                </Link>
            </div>
            <div className="channels-section">
                <div className="section-header">
                    <span>Channels ›</span>
                </div>
                <div className={`nav-item ${isMyChannelsActive() ? 'active' : ''}`}>
                    <i className="nav-icon">💬</i>
                    <span className="nav-text">My Channels</span>
                    <span className="channel-actions">⋯</span>
                    <span className="add-channel">+</span>
                </div>
                <Link to="/CreateChannel" className={`nav-item ${isActive('/CreateChannel') ? 'active' : ''}`}>
                    <i className="nav-icon">🔍</i>
                    <span className="nav-text">Create Channel</span>
                </Link>
                <Link to="/ManageChannel" className={`nav-item ${isActive('/ManageChannel') ? 'active' : ''}`}>
                    <i className="nav-icon">⚙️</i>
                    <span className="nav-text">Manage Channel</span>
                </Link>
                <Link to="/PublishPost" className={`nav-item ${isActive('/PublishPost') ? 'active' : ''}`}>
                    <i className="nav-icon">📤</i>
                    <span className="nav-text">Publish Post</span>
                    <span className="check-icon">✓</span>
                </Link>
                <Link to="/ViewChannelPost" className={`nav-item ${isActive('/ViewChannelPost') ? 'active' : ''}`}>
                    <i className="nav-icon">📜</i>
                    <span className="nav-text">View Channel Post</span>
                </Link>
            </div>
            <div className="help-section">
                <Link to="/help" className={`help-item ${isActive('/help') ? 'active' : ''}`}>
                    <i className="help-icon">❓</i>
                    <span className="help-text">Help</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;