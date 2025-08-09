import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/AdminManageActivitiesCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const AdminManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await api.get("/api/Activity");
            setActivities(res.data || []);
        } catch (error) {
            console.error("Failed to fetch activities:", error?.response || error);
            alert("Failed to fetch activities.");
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

    return (
        <div className="admin-manage-activities-container">
            <h2>Admin Manage Activities</h2>
            <table className="activities-table">
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
                {activities.map((activity) => (
                    <tr key={activity.activityId} onClick={() => handleRowClick(activity)}>
                        <td>{activity.activityId}</td>
                        <td>{activity.title}</td>
                        <td>{activity.location}</td>
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

            {showDetailsModal && selectedActivity && (
                <div className="details-modal-overlay">
                    <div className="details-modal">
                        <h3>{selectedActivity.title}</h3>
                        <p>
                            <strong>Location:</strong> {selectedActivity.location}
                        </p>
                        <p>
                            <strong>Date:</strong> {(selectedActivity.startTime || "").split(" ")[0]}
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
