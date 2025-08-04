import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../PagesCSS/DashboardCSS.css';

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-wrapper">
            {/* 左侧导航栏 */}
            <div className="sidebar">
                <div className="logo-container">
                    <span className="logo-icon">s</span>
                    <span className="logo-text">SaaS De...</span>
                    <span className="logo-dropdown">▼</span>
                </div>
                <div className="nav-items">
                    <div className="nav-item active">
                        <i className="nav-icon">📊</i>
                        <span className="nav-text">Dashboards</span>
                    </div>
                    <div className="nav-item" onClick={() => navigate('/home')}>
                        <i className="nav-icon">🏠</i>
                        <span className="nav-text">Home</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">✉️</i>
                        <span className="nav-text">Inbox</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">➕</i>
                        <span className="nav-text">Create Activity</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">📺</i>
                        <span className="nav-text">Manage Activities</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">ℹ️</i>
                        <span className="nav-text">More</span>
                    </div>
                </div>
                <div className="channels-section">
                    <div className="section-header">
                        <span>Channels ›</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">💬</i>
                        <span className="nav-text">My Channels</span>
                        <span className="channel-actions">⋯</span>
                        <span className="add-channel">+</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">⚙️</i>
                        <span className="nav-text">Manage Channel</span>
                        <span className="channel-count">3</span>
                    </div>
                    <div className="nav-item">
                        <i className="nav-icon">📤</i>
                        <span className="nav-text">Publish Post</span>
                        <span className="check-icon">✓</span>
                    </div>
                </div>
                <div className="help-section">
                    <div className="help-item">
                        <i className="help-icon">❓</i>
                        <span className="help-text">Help</span>
                    </div>
                </div>
            </div>

            {/* 主内容区 */}
            <div className="main-content">
                {/* 顶部标题栏 */}
                <div className="top-bar">
                    <div className="page-title">
                        <h2>Dashboards</h2>
                    </div>
                    <div className="search-box">
                        <i className="search-icon">🔍</i>
                        <input type="text" placeholder="Search" className="search-input" />
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="content-area">
                    {/* 模板部分 */}
                    <div className="templates-section">
                        <h3>Start with a template</h3>
                        <div className="templates-container">
                            <div className="template-card">
                                <div className="template-icon">📊</div>
                                <h4>Simple Dashboard</h4>
                                <p>Manage & prioritize tasks</p>
                            </div>
                            <div className="template-card">
                                <div className="template-icon">👥</div>
                                <h4>Team Reporting</h4>
                                <p>View progress across teams</p>
                            </div>
                            <div className="template-card">
                                <div className="template-icon">⏱️</div>
                                <h4>Time Tracking</h4>
                                <p>Report on time tracking metrics</p>
                            </div>
                        </div>
                    </div>

                    {/* 最近、收藏夹、个人创建部分 */}
                    <div className="content-row">
                        <div className="content-column">
                            <h3>Recent</h3>
                            <div className="dashboard-card">
                                <div className="dashboard-icon">📊</div>
                                <span>Dashboard</span>
                            </div>
                        </div>
                        <div className="content-column">
                            <h3>Favorites</h3>
                            <div className="empty-state">
                                <div className="empty-icon">⏰</div>
                                <p>Your favorited Dashboards will show here.</p>
                            </div>
                        </div>
                        <div className="content-column">
                            <h3>Created by Me</h3>
                            <div className="dashboard-card">
                                <div className="dashboard-icon">📊</div>
                                <span>Dashboard</span>
                            </div>
                        </div>
                    </div>

                    {/* 我的活动部分 */}
                    <div className="activities-section">
                        <div className="activities-header">
                            <div className="activities-title">
                                <span>My Activities</span>
                            </div>
                            <div className="channels-title">
                                <span>My Channels</span>
                            </div>
                            <div className="search-activities">
                                <i className="search-icon">🔍</i>
                                <span>Search</span>
                            </div>
                        </div>
                        <div className="activities-table">
                            <div className="table-header">
                                <div className="header-cell">Name</div>
                                <div className="header-cell">Location</div>
                                <div className="header-cell">Date</div>
                                <div className="header-cell">Number Limit</div>
                                <div className="header-cell">Tag</div>
                                <div className="header-cell">Status</div>
                            </div>
                            <div className="table-row">
                                <div className="row-cell activity-name">
                                    <span>Activity1</span>
                                    <span className="lock-icon">🔒</span>
                                </div>
                                <div className="row-cell">NUS-ISS</div>
                                <div className="row-cell">23/7/2025</div>
                                <div className="row-cell">15/30</div>
                                <div className="row-cell">English</div>
                                <div className="row-cell">Approved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}