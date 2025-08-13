import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageActivityRequestsCSS.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageActivityRequests = () => {
    const [activityRequests, setActivityRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [loaded, setLoaded] = useState(false);

    const navigate = useNavigate();

    // 顶部工具条
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    // 详情弹窗（与 ManageChannelRequests 统一风格）
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchActivityRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchActivityRequests = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getAllActivityRequest");
            setActivityRequests(res.data || []);
        } catch (error) {
            console.error("Failed to fetch activity requests:", error?.response || error);
            if (error?.response?.status === 401) {
                navigate("/adminLogin");
            } else {
                setErr("Failed to fetch activity requests.");
            }
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await api.put(`/api/Activity/approve/${requestId}`, null, {
                params: { status }, // ?status=approved / rejected
            });
            alert(`Request ${requestId} has been ${status}.`);
            await fetchActivityRequests();
            navigate("/AdminManageActivityRequests");
        } catch (error) {
            console.error("Failed to review request:", error?.response || error);
            alert("Failed to review request. Please try again.");
        }
    };

    // 点击行：根据 activityId 获取详情
    const handleRowClick = async (activityId) => {
        if (!activityId) return;
        setShowDetailsModal(true);
        setLoadingDetails(true);
        setSelectedActivity(null);
        try {
            const res = await api.get(`/api/Activity/${activityId}`);
            setSelectedActivity(res.data || null);
        } catch (error) {
            console.error("Failed to fetch activity details:", error?.response || error);
            alert("Failed to load activity details.");
            setShowDetailsModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    // ========== 计算：搜索 + 统计 ==========
    const pendingList = useMemo(
        () => (activityRequests || []).filter((r) => r.status !== "approved" && r.status !== "rejected"),
        [activityRequests]
    );

    const filteredRequests = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return pendingList;
        return pendingList.filter((r) => {
            const id = String(r.id ?? "").toLowerCase();
            const actId = String(r.activityId ?? "").toLowerCase();
            const reviewer = String(r.reviewedById ?? "").toLowerCase();
            const type = (r.requestType || "").toLowerCase();
            const status = (r.status || "").toLowerCase();
            const reqAt = ((r.requestedAt || "").split("T")[0] || "").toLowerCase();
            const revAt = ((r.reviewedAt || "").split("T")[0] || "").toLowerCase();
            return (
                id.includes(q) ||
                actId.includes(q) ||
                reviewer.includes(q) ||
                type.includes(q) ||
                status.includes(q) ||
                reqAt.includes(q) ||
                revAt.includes(q)
            );
        });
    }, [pendingList, searchTerm]);

    const overviewStats = useMemo(() => {
        const total = activityRequests.length;
        const statusMap = {};
        activityRequests.forEach((r) => {
            const s = (r.status || "Unknown").trim();
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        return { total, statusMap, pending: pendingList.length };
    }, [activityRequests, pendingList]);

    // ===== 早退：空数组 =====
    if (!loading && !err && loaded && activityRequests.length === 0) {
        return (
            <div className="manage-activity-requests-container">
                <h2>Manage Activity Requests</h2>
                <p className="no-data">no requests</p>
            </div>
        );
    }

    // 辅助：格式化日期（尽量与后端返回保持简单展示）
    const fmt = (val) => (val ? String(val).split(/[T ]/)[0] : "");

    return (
        <div className="manage-activity-requests-container">
            <h2>Manage Activity Requests</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条 */}
            {!loading && pendingList.length > 0 && (
                <div className="requests-header">
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

                    <div className="search-wrap">
                        {showSearchBar && (
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by id / activityId / reviewer / type / status / date..."
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

            {/* 主区域 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total</div>
                            <div className="overview-number">{overviewStats.total}</div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-title">Pending</div>
                            <div className="overview-number">{overviewStats.pending}</div>
                        </div>
                        <div className="overview-card wide">
                            <div className="overview-title">By Status</div>
                            <div className="badge-list">
                                {Object.keys(overviewStats.statusMap).length === 0 ? (
                                    <span className="badge">No status data</span>
                                ) : (
                                    Object.entries(overviewStats.statusMap).map(([k, v]) => (
                                        <span key={k} className="badge">
                                            {k}: <b>{v}</b>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : filteredRequests.length > 0 ? (
                    <table className="requests-table">
                        {/* 固定列宽，严格对齐 */}
                        <colgroup>
                            <col className="col-id" />
                            <col className="col-activity" />
                            <col className="col-reviewer" />
                            <col className="col-type" />
                            <col className="col-status" />
                            <col className="col-date" />
                            <col className="col-actions" />
                        </colgroup>

                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>ActivityId</th>
                            <th>ReviewedById</th>
                            <th>Request Type</th>
                            <th>Status</th>
                            <th>Requested At</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredRequests.map((request) => (
                            <tr
                                key={request.id}
                                className="table-not"
                                onClick={() => handleRowClick(request.activityId)}
                            >
                                <td>{request.id}</td>
                                <td>{request.activityId}</td>
                                <td>{request.reviewedById}</td>
                                <td>{request.requestType}</td>
                                <td className="nowrap">{request.status}</td>
                                <td className="nowrap">{fmt(request.requestedAt)}</td>
                                <td
                                    className="actions-cell nowrap"
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                ) : (
                    pendingList.length > 0 && <p className="no-data">No matching requests</p>
                )
            )}

            {/* 详情弹窗（统一 report-details-modal 风格） */}
            {showDetailsModal && (
                <div className="report-details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div
                        className="report-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Activity Details</h3>
                            <button
                                className="close-btn"
                                aria-label="Close"
                                onClick={() => setShowDetailsModal(false)}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingDetails ? (
                                <div className="reason-box">Loading...</div>
                            ) : selectedActivity ? (
                                <>
                                    <div className="kv">
                                        <div className="k">Title</div>
                                        <div className="v">{selectedActivity.title || "-"}</div>
                                    </div>
                                    <div className="kv">
                                        <div className="k">Location</div>
                                        <div className="v">{selectedActivity.location || "-"}</div>
                                    </div>
                                    <div className="kv">
                                        <div className="k">Status</div>
                                        <div className="v">{selectedActivity.status || "-"}</div>
                                    </div>
                                    <div className="kv">
                                        <div className="k">Start Time</div>
                                        <div className="v">{fmt(selectedActivity.startTime) || "-"}</div>
                                    </div>
                                    <div className="kv">
                                        <div className="k">End Time</div>
                                        <div className="v">{fmt(selectedActivity.endTime) || "-"}</div>
                                    </div>
                                    <div className="kv">
                                        <div className="k">URL</div>
                                        <div className="v">
                                            {selectedActivity.url ? (
                                                <a
                                                    href={/^https?:\/\//i.test(selectedActivity.url) ? selectedActivity.url : `https://${selectedActivity.url}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {selectedActivity.url}
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </div>
                                    </div>
                                    <div className="kv col">
                                        <div className="k">Description</div>
                                        <div className="reason-box">
                                            {selectedActivity.description || "-"}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="reason-box">No details found.</div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="back-btn"
                                onClick={() => setShowDetailsModal(false)}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageActivityRequests;
