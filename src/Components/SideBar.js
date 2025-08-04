import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
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
        } finally {
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Login/check',{
                withCredentials: true
            });
            if (response.status === 401) {
                navigate("/OrganizerLogin")
            }
        } catch (err) {
            console.error(err);
            alert("Not logged in");
            navigate("/")
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
                <Link to="/Dashboard" className={`nav-item ${isActive('/Dashboard') ? 'active' : ''}`}>
                    <i className="nav-icon">📊</i>
                    <span className="nav-text">Dashboards</span>
                </Link>
                <Link to="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`}>
                    <i className="nav-icon">🏠</i>
                    <span className="nav-text">Home</span>
                </Link>
                <Link to="/inbox" className={`nav-item ${isActive('/inbox') ? 'active' : ''}`}>
                    <i className="nav-icon">✉️</i>
                    <span className="nav-text">Inbox</span>
                    <span className="icon-link">{unreadMessages}</span>
                </Link>
                <Link to="/CreateActivity" className={`nav-item ${isActive('/CreateActivity') ? 'active' : ''}`}>
                    <i className="nav-icon">➕</i>
                    <span className="nav-text">Create Activity</span>
                </Link>
                <Link to="/ManageActivities" className={`nav-item ${isActive('/ManageActivities') ? 'active' : ''}`}>
                    <i className="nav-icon">📺</i>
                    <span className="nav-text">Manage Activities</span>
                </Link>
                <Link to="/more" className={`nav-item ${isActive('/more') ? 'active' : ''}`}>
                    <i className="nav-icon">ℹ️</i>
                    <span className="nav-text">More</span>
                </Link>
            </div>
            <div className="channels-section">
                <div className="section-header">
                    <span>Channels ›</span>
                </div>
                <Link to="/channels/my-channels" className={`nav-item ${isActive('/channels/my-channels') ? 'active' : ''}`}>
                    <i className="nav-icon">💬</i>
                    <span className="nav-text">My Channels</span>
                    <span className="channel-actions">⋯</span>
                    <span className="add-channel">+</span>
                </Link>
                <Link to="/channels/manage-channel" className={`nav-item ${isActive('/channels/manage-channel') ? 'active' : ''}`}>
                    <i className="nav-icon">⚙️</i>
                    <span className="nav-text">Manage Channel</span>
                </Link>
                <Link to="/channels/publish-post" className={`nav-item ${isActive('/channels/publish-post') ? 'active' : ''}`}>
                    <i className="nav-icon">📤</i>
                    <span className="nav-text">Publish Post</span>
                    <span className="check-icon">✓</span>
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