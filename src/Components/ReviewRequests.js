import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ReviewRequestsCSS.css';
import {useNavigate} from "react-router-dom";

const ReviewRequests = () => {
    const [reviewRequests, setReviewRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviewRequests();
    }, []);

    const fetchReviewRequests = async () => {
        try {
            const response = await axios.get('https://localhost:7085/getOrganizerActivityRegisterRequest');
            setReviewRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch review requests:", error);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await axios.put(`https://localhost:7085/api/Activity/review/${requestId}`, status,
                {
                    headers: {
                        'Content-Type': 'application/json' // 保持 JSON 格式
                    }
                });
            alert(`Request ${requestId} has been ${status}.`);
            fetchReviewRequests();
            navigate(0);
        } catch (error) {
            console.error("Failed to review request:", error);
            alert('Failed to review request. Please try again.');
        }
    };

    return (
        <div className="review-requests-container">
            <h2>Review User Activity Requests</h2>
            <div className="requests-table">
                <div className="table-header">
                    <div className="table-cell">User</div>
                    <div className="table-cell">Activity</div>
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                </div>
                <div className="table-body">
                    {reviewRequests.map(request => (
                        <div className="table-row" key={request.id}>
                            <div className="table-cell">{request.user.name}</div>
                            <div className="table-cell">{request.activity.title}</div>
                            <div className="table-cell">{request.requestedAt.split('T')[0]}</div>
                            <div className="table-cell">{request.status}</div>
                            <div className="table-cell">
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewRequests;