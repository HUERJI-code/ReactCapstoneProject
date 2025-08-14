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
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [loaded, setLoaded] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchReviewRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchReviewRequests = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getOrganizerActivityRegisterRequest");
            setReviewRequests(res.data || []);
        } catch (error) {
            console.error("Failed to fetch review requests:", error?.response || error);
            if (error?.response?.status === 401) navigate("/OrganizerLogin");
            else return (
                <div className="manage-activities-container">
                    <h2>My Activities</h2>
                    <p className="no-activity">no activity</p>
                </div>
            );
            setReviewRequests([]); // 确保为空数组
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await api.put(`/api/Activity/review/${requestId}`, status, {
                headers: { "Content-Type": "application/json" },
            });
            alert(`Request ${requestId} has been ${status}.`);
            navigate(0)
        } catch (error) {
            console.error("Failed to review request:", error?.response || error);
            alert("Failed to review request. Please try again.");
        }
    };

    // 初始加载完成且为空：仅显示空提示（不显示表头/按钮）
    if (!loading && !err && loaded && reviewRequests.length === 0) {
        return (
            <div className="review-requests-container">
                <h2>Review User Activity Requests</h2>
                <div className="no-activity" style={{ textAlign: "center" }}>
                    No requests.
                </div>
            </div>
        );
    }

    return (
        <div className="review-requests-container">
            <h2>Review User Activity Requests</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 列表：仅在非加载且有数据时渲染（含表头与按钮） */}
            {!loading && !err && reviewRequests.length > 0 && (
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
                                <div className="table-cell">{request.user?.name ?? "—"}</div>
                                <div className="table-cell">{request.activity?.title ?? "—"}</div>
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
            )}
        </div>
    );
};

export default ReviewRequests;
