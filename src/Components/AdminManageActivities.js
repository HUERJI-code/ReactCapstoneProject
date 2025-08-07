import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/AdminManageActivitiesCSS.css';

const AdminManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Activity');
            setActivities(response.data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        }
    };

    const handleBanActivity = async (activityId) => {
        try {
            await axios.put(`https://localhost:7085/banActivity?activityId=${activityId}`);
            alert('Activity banned successfully!');
            fetchActivities(); // Refresh activities list after ban
        } catch (error) {
            console.error("Failed to ban activity:", error);
            alert('Failed to ban activity. Please try again.');
        }
    };

    const handleUnbanActivity = async (activityId) => {
        try {
            await axios.put(`https://localhost:7085/UnbanActivity?activityId=${activityId}`);
            alert('Activity unbanned successfully!');
            fetchActivities(); // Refresh activities list after unban
        } catch (error) {
            console.error("Failed to unban activity:", error);
            alert('Failed to unban activity. Please try again.');
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
                {activities.map(activity => (
                    <tr key={activity.activityId} onClick={() => handleRowClick(activity)}>
                        <td>{activity.activityId}</td>
                        <td>{activity.title}</td>
                        <td>{activity.location}</td>
                        <td>{activity.startTime.split('T')[0]}</td>
                        <td>{activity.status}</td>
                        <td>
                            {activity.status !== 'banned' ? (
                                <button
                                    className="ban-button"
                                    onClick={(e) => {
                                        handleBanActivity(activity.activityId);
                                        e.stopPropagation();
                                    }}
                                >
                                    Ban
                                </button>
                            ) : (
                                <button
                                    className="unban-button"
                                    onClick={(e) => {
                                        handleUnbanActivity(activity.activityId);
                                        e.stopPropagation();
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
                        <p><strong>Location:</strong> {selectedActivity.location}</p>
                        <p><strong>Date:</strong> {selectedActivity.startTime.split(' ')[0]}</p>
                        <p><strong>Description:</strong> {selectedActivity.description}</p>
                        <p><strong>StartTime:</strong>{selectedActivity.startTime}</p>
                        <p><strong>EndTime:</strong>{selectedActivity.endTime}</p>
                        <p><strong>Status:</strong> {selectedActivity.status}</p>
                        <button onClick={() => setShowDetailsModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageActivities;