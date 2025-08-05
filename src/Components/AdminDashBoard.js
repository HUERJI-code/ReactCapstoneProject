import React from 'react';
import '../ComponentsCSS/AdminDashBoardCSS.css';

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard-wrapper">
            <div className="main-content">
                {/* 顶部标题栏 */}
                <div className="top-bar">
                    <div className="page-title">
                        <h2>Admin Dashboard</h2>
                    </div>
                    <div className="search-box">
                        <i className="search-icon">🔍</i>
                        <input type="text" placeholder="Search" className="search-input" />
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="content-area">
                    {/* 用户管理部分 */}
                    <div className="user-management-section">
                        <h3>User Management</h3>
                        <div className="user-list">
                            <div className="user-card">
                                <div className="user-icon">👤</div>
                                <div className="user-details">
                                    <h4>Organizer 1</h4>
                                    <p>organizer1@example.com</p>
                                </div>
                                <div className="user-status">Active</div>
                            </div>
                            <div className="user-card">
                                <div className="user-icon">👤</div>
                                <div className="user-details">
                                    <h4>Organizer 2</h4>
                                    <p>organizer2@example.com</p>
                                </div>
                                <div className="user-status">Active</div>
                            </div>
                            <div className="user-card">
                                <div className="user-icon">👤</div>
                                <div className="user-details">
                                    <h4>Organizer 3</h4>
                                    <p>organizer3@example.com</p>
                                </div>
                                <div className="user-status">Pending</div>
                            </div>
                        </div>
                    </div>

                    {/* 频道管理部分 */}
                    <div className="channel-management-section">
                        <h3>Channel Management</h3>
                        <div className="channel-list">
                            <div className="channel-card">
                                <div className="channel-icon">📺</div>
                                <div className="channel-details">
                                    <h4>Channel A</h4>
                                    <p>Created by Organizer 1</p>
                                </div>
                                <div className="channel-status">Approved</div>
                            </div>
                            <div className="channel-card">
                                <div className="channel-icon">📺</div>
                                <div className="channel-details">
                                    <h4>Channel B</h4>
                                    <p>Created by Organizer 2</p>
                                </div>
                                <div className="channel-status">Pending</div>
                            </div>
                            <div className="channel-card">
                                <div className="channel-icon">📺</div>
                                <div className="channel-details">
                                    <h4>Channel C</h4>
                                    <p>Created by Organizer 3</p>
                                </div>
                                <div className="channel-status">Rejected</div>
                            </div>
                        </div>
                    </div>

                    {/* 活动管理部分 */}
                    <div className="activity-management-section">
                        <h3>Activity Management</h3>
                        <div className="activity-table">
                            <div className="table-header">
                                <div className="header-cell">Activity Name</div>
                                <div className="header-cell">Location</div>
                                <div className="header-cell">Date</div>
                                <div className="header-cell">Organizer</div>
                                <div className="header-cell">Status</div>
                                <div className="header-cell">Actions</div>
                            </div>
                            <div className="table-row">
                                <div className="row-cell">Activity 1</div>
                                <div className="row-cell">NUS-ISS</div>
                                <div className="row-cell">23/7/2025</div>
                                <div className="row-cell">Organizer 1</div>
                                <div className="row-cell">Approved</div>
                                <div className="row-cell">
                                    <button className="action-btn approve-btn">Approve</button>
                                    <button className="action-btn reject-btn">Reject</button>
                                </div>
                            </div>
                            <div className="table-row">
                                <div className="row-cell">Activity 2</div>
                                <div className="row-cell">NUS-ISS</div>
                                <div className="row-cell">24/7/2025</div>
                                <div className="row-cell">Organizer 2</div>
                                <div className="row-cell">Pending</div>
                                <div className="row-cell">
                                    <button className="action-btn approve-btn">Approve</button>
                                    <button className="action-btn reject-btn">Reject</button>
                                </div>
                            </div>
                            <div className="table-row">
                                <div className="row-cell">Activity 3</div>
                                <div className="row-cell">NUS-ISS</div>
                                <div className="row-cell">25/7/2025</div>
                                <div className="row-cell">Organizer 3</div>
                                <div className="row-cell">Rejected</div>
                                <div className="row-cell">
                                    <button className="action-btn approve-btn">Approve</button>
                                    <button className="action-btn reject-btn">Reject</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}