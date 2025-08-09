import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/ReviewReportedChannelCSS.css";
import { useNavigate } from "react-router-dom";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ReviewReportedChannel = () => {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get("/getAllChannelReports");
            // 仅保留待审核
            setReports((res.data || []).filter(r => r.status !== "approved" && r.status !== "rejected"));
        } catch (error) {
            console.error("Failed to fetch reports:", error?.response || error);
            if (error?.response?.status === 401) navigate("/adminLogin");
            else alert("Failed to fetch reports.");
        }
    };

    const handleReview = async (reportId, status) => {
        try {
            await api.put("/api/channel/channels/reports/review", null, {
                params: { id: reportId, status }, // → ?id=...&status=approved/rejected
            });
            alert(`Report ${reportId} has been ${status}.`);
            await fetchReports();
            // 刷新当前页
            navigate(0);
        } catch (error) {
            console.error("Failed to review report:", error?.response || error);
            alert("Failed to review report. Please try again.");
        }
    };

    return (
        <div className="review-channel-messages-container">
            <h2>Review Channel Messages</h2>
            <table className="reports-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>ChannelId</th>
                    <th>ReportedById</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reported At</th>
                    <th>Reviewed At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {reports.map((r) => (
                    <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.channelId}</td>
                        <td>{r.reportedById}</td>
                        <td>{r.reason}</td>
                        <td>{r.status}</td>
                        <td>{(r.reportedAt || "").split("T")[0]}</td>
                        <td>{r.reviewedAt ? r.reviewedAt.split("T")[0] : "Not reviewed"}</td>
                        <td className="table-cell actions-cell">
                            <div className="btn-group">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleReview(r.id, "approved")}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleReview(r.id, "rejected")}
                                >
                                    Reject
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {reports.length === 0 && (
                    <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>
                            No pending reports.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ReviewReportedChannel;
