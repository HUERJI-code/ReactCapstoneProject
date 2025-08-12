// AdminManageActivities.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/AdminManageActivitiesCSS.css";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const AdminManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // 顶部工具条
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    // 新增：加载/错误状态
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/api/Activity");
            setActivities(res.data || []);
        } catch (error) {
            console.error("Failed to fetch activities:", error?.response || error);
            setErr("Failed to fetch activities.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleBanActivity = async (activityId) => {
        try {
            await api.put(`/banActivity`, null, { params: { activityId } });
            alert("Activity banned successfully!");
            fetchActivities();
        } catch (error) {
            console.error("Failed to ban activity:", error?.response || error);
            alert("Failed to ban activity. Please try again.");
        }
    };

    const handleUnbanActivity = async (activityId) => {
        try {
            await api.put(`/UnbanActivity`, null, { params: { activityId } });
            alert("Activity unbanned successfully!");
            fetchActivities();
        } catch (error) {
            console.error("Failed to unban activity:", error?.response || error);
            alert("Failed to unban activity. Please try again.");
        }
    };

    const handleRowClick = (activity) => {
        setSelectedActivity(activity);
        setShowDetailsModal(true);
    };

    // 模糊搜索：title/location/status/date(yyyy/mm/dd)
    const filteredActivities = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return activities;
        return activities.filter((a) => {
            const title = (a.title || "").toLowerCase();
            const location = (a.location || "").toLowerCase();
            const status = (a.status || "").toLowerCase();
            const dateStr = ((a.startTime || "").split(" ")[0] || "").toLowerCase();
            return (
                title.includes(q) ||
                location.includes(q) ||
                status.includes(q) ||
                dateStr.includes(q)
            );
        });
    }, [activities, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = activities.length;
        const statusMap = {};
        activities.forEach((a) => {
            const s = (a.status || "Unknown").trim();
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        return { total, statusMap };
    }, [activities]);

    // 初始加载为空：不显示工具条/表格
    if (!loading && !err && loaded && activities.length === 0) {
        return (
            <div className="admin-manage-activities-container">
                <h2>Admin Manage Activities</h2>
                <p className="no-activity">no activity</p>
            </div>
        );
    }

    return (
        <div className="admin-manage-activities-container">
            <h2>Admin Manage Activities</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：只要初始非空（activities.length > 0），之后搜索为空也不隐藏 */}
            {!loading && activities.length > 0 && (
                <div className="activities-header">
                    <div className="view-options">
                        <button
                            className={`overview-btn ${showOverview ? "active" : ""}`}
                            onClick={() => setShowOverview(true)}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`list-btn ${!showOverview ? "active" : ""}`}
                            onClick={() => setShowOverview(false)}
                        >
                            📋 List
                        </button>
                    </div>
                    <div className="search-customize">
                        {showSearchBar && (
                            <input
                                type="text"
                                placeholder="Search by title / location / status / date..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        )}
                        <button
                            className="hide-btn"
                            onClick={() => setShowSearchBar((v) => !v)}
                            title={showSearchBar ? "Hide search bar" : "Show search bar"}
                        >
                            {showSearchBar ? "⨉Hide" : "Show"}
                        </button>
                    </div>
                </div>
            )}

            {/* 主区域：表头仅在过滤后有结果时显示；无结果仅提示 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total</div>
                            <div className="overview-number">{overviewStats.total}</div>
                        </div>
                        <div className="overview-card wide">
                            <div className="overview-title">By Status</div>
                            <div className="status-list">
                                {Object.keys(overviewStats.statusMap).length === 0 ? (
                                    <span className="status-item">No status data</span>
                                ) : (
                                    Object.entries(overviewStats.statusMap).map(([k, v]) => (
                                        <span key={k} className="status-item">
                      {k}: <b>{v}</b>
                    </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : filteredActivities.length > 0 ? (
                    <table className="activities-table">
                        {/* 用 colgroup 明确列宽，避免被内容挤压 */}
                        <colgroup>
                            <col className="col-id" />
                            <col className="col-title" />
                            <col className="col-location" />
                            <col className="col-date" />
                            <col className="col-status" />
                            <col className="col-actions" />
                        </colgroup>

                        <thead>
                        <tr>
                            <th>Activity ID</th>
                            <th>Title</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredActivities.map((activity) => (
                            <tr
                                key={activity.activityId}
                                onClick={() => handleRowClick(activity)}
                                className="table-not"
                            >
                                <td>{activity.activityId}</td>
                                <td title={activity.title}>{activity.title}</td>
                                <td title={activity.location}>{activity.location}</td>
                                <td>{(activity.startTime || "").split(" ")[0]}</td>
                                <td>{activity.status}</td>
                                <td>
                                    {activity.status !== "banned" ? (
                                        <button
                                            className="ban-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBanActivity(activity.activityId);
                                            }}
                                        >
                                            Ban
                                        </button>
                                    ) : (
                                        <button
                                            className="unban-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnbanActivity(activity.activityId);
                                            }}
                                        >
                                            Unban
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    activities.length > 0 && (
                        <p className="no-data">No matching activities</p>
                    )
                )
            )}

            {showDetailsModal && selectedActivity && (
                <div className="details-modal-overlay">
                    <div className="details-modal">
                        <h3>{selectedActivity.title}</h3>
                        <p>
                            <strong>Location:</strong> {selectedActivity.location}
                        </p>
                        <p>
                            <strong>Date:</strong>{" "}
                            {(selectedActivity.startTime || "").split(" ")[0]}
                        </p>
                        <p>
                            <strong>Description:</strong> {selectedActivity.description}
                        </p>
                        <p>
                            <strong>StartTime:</strong> {selectedActivity.startTime}
                        </p>
                        <p>
                            <strong>EndTime:</strong> {selectedActivity.endTime}
                        </p>
                        <p>
                            <strong>Status:</strong> {selectedActivity.status}
                        </p>
                        <button onClick={() => setShowDetailsModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageActivities;
