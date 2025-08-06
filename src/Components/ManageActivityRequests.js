import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageActivityRequestsCSS.css';
import { useNavigate } from "react-router-dom";

const ManageActivityRequests = () => {
    const [activityRequests, setActivityRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivityRequests();
    }, []);

    const fetchActivityRequests = async () => {
        try {
            const response = await axios.get('https://localhost:7085/getAllActivityRequest');
            console.log(response.data);
            setActivityRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch activity requests:", error);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await axios.put(`https://localhost:7085/api/Activity/approve/${requestId}?status=${status}`);
            alert(`Request ${requestId} has been ${status}.`);
            fetchActivityRequests();
            navigate('/AdminManageActivityRequests'); // 假设 AdminManageActivityRequests 是导航目标
        } catch (error) {
            console.error("Failed to review request:", error);
            alert('Failed to review request. Please try again.');
        }
    };

    return (
        <div className="manage-activity-requests-container">
            <h2>Manage Activity Requests</h2>
            <table className="requests-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>ActivityId</th>
                    <th>ReviewedById</th>
                    <th>Request Type</th>
                    <th>Status</th>
                    <th>Requested At</th>
                    <th>Reviewed At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {activityRequests.filter(request => request.status !== 'approved' && request.status !== 'rejected').map(request => (
                    <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.activityId}</td>
                        <td>{request.reviewedById}</td>
                        <td>{request.requestType}</td>
                        <td>{request.status}</td>
                        <td>{request.requestedAt.split('T')[0]}</td>
                        <td>{request.reviewedAt ? request.reviewedAt.split('T')[0] : 'Not reviewed'}</td>
                        <td className="table-cell actions-cell">
                            <button
                                className="approve-btn"
                                onClick={() => handleReview(request.id, 'approved')}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={() => handleReview(request.id, 'rejected')}
                            >
                                Reject
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageActivityRequests;