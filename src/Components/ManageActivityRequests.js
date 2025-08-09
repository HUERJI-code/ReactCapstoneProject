import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageActivityRequestsCSS.css";
import { useNavigate } from "react-router-dom";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageActivityRequests = () => {
    const [activityRequests, setActivityRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivityRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchActivityRequests = async () => {
        try {
            const res = await api.get("/getAllActivityRequest");
            setActivityRequests(res.data || []);
        } catch (error) {
            console.error("Failed to fetch activity requests:", error?.response || error);
            if (error?.response?.status === 401) {
                navigate("/adminLogin");
            } else {
                alert("Failed to fetch activity requests.");
            }
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await api.put(`/api/Activity/approve/${requestId}`, null, {
                params: { status }, // 等价于 ?status=approved / rejected
            });
            alert(`Request ${requestId} has been ${status}.`);
            await fetchActivityRequests(); // 刷新列表
            navigate("/AdminManageActivityRequests");
        } catch (error) {
            console.error("Failed to review request:", error?.response || error);
            alert("Failed to review request. Please try again.");
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
                {activityRequests
                    .filter((r) => r.status !== "approved" && r.status !== "rejected")
                    .map((request) => (
                        <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>{request.activityId}</td>
                            <td>{request.reviewedById}</td>
                            <td>{request.requestType}</td>
                            <td>{request.status}</td>
                            <td>{(request.requestedAt || "").split("T")[0]}</td>
                            <td>
                                {request.reviewedAt ? request.reviewedAt.split("T")[0] : "Not reviewed"}
                            </td>
                            <td className="table-cell actions-cell">
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageActivityRequests;
