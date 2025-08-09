import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/ReviewRequestsCSS.css";
import { useNavigate } from "react-router-dom";

// ===== 后端地址（云端域名；本地联调用 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ReviewRequests = () => {
    const [reviewRequests, setReviewRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviewRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchReviewRequests = async () => {
        try {
            const res = await api.get("/getOrganizerActivityRegisterRequest");
            setReviewRequests(res.data || []);
        } catch (error) {
            console.error("Failed to fetch review requests:", error?.response || error);
            if (error?.response?.status === 401) navigate("/OrganizerLogin");
            else setReviewRequests([]); // 确保是空数组而不是 undefined
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await api.put(`/api/Activity/review/${requestId}`, status, {
                headers: { "Content-Type": "application/json" },
            });
            alert(`Request ${requestId} has been ${status}.`);
            await fetchReviewRequests();
        } catch (error) {
            console.error("Failed to review request:", error?.response || error);
            alert("Failed to review request. Please try again.");
        }
    };

    return (
        <div className="review-requests-container">
            <h2>Review User Activity Requests</h2>

            {reviewRequests.length > 0 ? (
                <div className="requests-table">
                    <div className="table-header">
                        <div className="table-cell">User</div>
                        <div className="table-cell">Activity</div>
                        <div className="table-cell">Date</div>
                        <div className="table-cell">Status</div>
                        <div className="table-cell">Actions</div>
                    </div>
                    <div className="table-body">
                        {reviewRequests.map((request) => (
                            <div className="table-row" key={request.id}>
                                <div className="table-cell">{request.user?.name}</div>
                                <div className="table-cell">{request.activity?.title}</div>
                                <div className="table-cell">
                                    {(request.requestedAt || "").split("T")[0]}
                                </div>
                                <div className="table-cell">{request.status}</div>
                                <div className="table-cell">
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleReview(request.id, "approved")}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleReview(request.id, "rejected")}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: "center" }}>No requests.</div>
            )}
        </div>
    );
};

export default ReviewRequests;
