import React from 'react';
import '../PagesCSS/DashboardCSS.css';

export default function Dashboard() {
    return (
        <div className="dashboard-wrapper">
            <div className="main-content">
                {/* 顶部标题栏 */}
                <div className="top-bar">
                    <div className="page-title">
                        <h2>Dashboards</h2>
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