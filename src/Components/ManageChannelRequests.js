import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageChannelRequestsCSS.css";
import { useNavigate } from "react-router-dom";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageChannelRequests = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [selectedReport, setSelectedReport] = useState(null); // 当前选中行
    const [showDetailsModal, setShowDetailsModal] = useState(false); // 详情弹窗
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getAllChannelReports");
            setReports(res.data || []);
        } catch (e) {
            console.error("Failed to fetch channel reports:", e?.response || e);
            setErr("Failed to fetch channel reports.");
            if (e?.response?.status === 401) navigate("/adminLogin");
        } finally {
            setLoading(false);
        }
    };

    const fmtDate = (val) => {
        if (!val) return "—";
        try {
            const d = new Date(val);
            if (Number.isNaN(d.getTime())) {
                return String(val).split("T")[0] || String(val);
            }
            return d.toISOString().split("T")[0];
        } catch {
            return String(val);
        }
    };

    const handleReview = async (requestId, status, e) => {
        if (e) e.stopPropagation(); // 防止冒泡触发行点击
        try {
            await api.put("/api/channel/channels/reports/review", null, {
                params: { id: requestId, status }, // → ?id=...&status=approved/rejected
            });
            alert(`Report ${requestId} has been ${status}.`);
            await fetchReports();
            navigate("/ManageChannelRequests");
        } catch (error) {
            console.error("Failed to review report:", error?.response || error);
            alert("Failed to review report. Please try again.");
        }
    };

    // 行点击：打开详情弹窗
    const handleRowClick = (report) => {
        setSelectedReport(report);
        setShowDetailsModal(true);
    };

    const pendingReports = reports.filter(
        (r) => r.status !== "approved" && r.status !== "rejected"
    );

    return (
        <div className="manage-channel-requests-container">
            <h2>Manage Channel Reports</h2>

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}
            {!loading && !err && pendingReports.length === 0 && (
                <div className="banner empty">No pending reports.</div>
            )}

            <table className="requests-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Channel Id</th>
                    <th>Reported By</th>
                    <th>Status</th>
                    <th>Reviewed At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {pendingReports.map((r) => (
                    <tr
                        key={r.id}
                        onClick={() => handleRowClick(r)}
                        className="clickable-row"
                    >
                        <td>{r.id}</td>
                        <td>{r.channelId}</td>
                        <td>{r.reportedById ?? "—"}</td>
                        <td>{r.status}</td>
                        <td>{fmtDate(r.reviewedAt)}</td>
                        <td className="actions-cell">
                            <button
                                className="approve-btn"
                                onClick={(e) => handleReview(r.id, "approved", e)}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={(e) => handleReview(r.id, "rejected", e)}
                            >
                                Reject
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 详情弹窗 */}
            {showDetailsModal && selectedReport && (
                <div
                    className="report-details-modal-overlay"
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div
                        className="report-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Report Details</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowDetailsModal(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="kv">
                                <span className="k">Id:</span>
                                <span className="v">{selectedReport.id}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Channel Id:</span>
                                <span className="v">{selectedReport.channelId}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Reported By:</span>
                                <span className="v">{selectedReport.reportedById ?? "—"}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Status:</span>
                                <span className="v">{selectedReport.status}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Created At:</span>
                                <span className="v">{fmtDate(selectedReport.createdAt)}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Reviewed At:</span>
                                <span className="v">{fmtDate(selectedReport.reviewedAt)}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Reviewed By:</span>
                                <span className="v">{selectedReport.reviewedById ?? "—"}</span>
                            </div>

                            <div className="kv col">
                                <span className="k">Reason:</span>
                                <div className="reason-box">
                                    {selectedReport.reason || "—"}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="approve-btn"
                                onClick={() => handleReview(selectedReport.id, "approved")}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={() => handleReview(selectedReport.id, "rejected")}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageChannelRequests;
