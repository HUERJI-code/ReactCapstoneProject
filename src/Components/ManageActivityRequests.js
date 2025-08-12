// ManageActivityRequests.js
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

    // ========== 计算：搜索 + 统计 ==========
    // 列表只展示“未处理”的（排除 approved / rejected）
    const pendingList = useMemo(
        () => (activityRequests || []).filter((r) => r.status !== "approved" && r.status !== "rejected"),
        [activityRequests]
    );

    // 模糊搜索（Id/ActivityId/ReviewedById/RequestType/Status/日期）
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

    // Overview 统计（基于全部请求）
    const overviewStats = useMemo(() => {
        const total = activityRequests.length;
        const statusMap = {};
        activityRequests.forEach((r) => {
            const s = (r.status || "Unknown").trim();
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        return { total, statusMap, pending: pendingList.length };
    }, [activityRequests, pendingList]);

    // ===== 早退：接口返回空数组（不显示按钮/搜索框/表头/表格）=====
    if (!loading && !err && loaded && activityRequests.length === 0) {
        return (
            <div className="manage-activity-requests-container">
                <h2>Manage Activity Requests</h2>
                <p className="no-data">no requests</p>
            </div>
        );
    }

    return (
        <div className="manage-activity-requests-container">
            <h2>Manage Activity Requests</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：一旦“初始（pendingList）非空”，之后搜索为空也不隐藏 */}
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
                    // 概览：当工具条可见时可切换到 Overview
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
                    // 只有在过滤后有结果时才渲染表格（包含表头）
                    <table className="requests-table">
                        {/* 固定列宽，严格对齐 */}
                        <colgroup>
                            <col className="col-id" />
                            <col className="col-activity" />
                            <col className="col-reviewer" />
                            <col className="col-type" />
                            <col className="col-status" />
                            <col className="col-date" />
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
                            <th>Reviewed At</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredRequests.map((request) => (
                            <tr key={request.id} className="table-not">
                                <td>{request.id}</td>
                                <td>{request.activityId}</td>
                                <td>{request.reviewedById}</td>
                                <td>{request.requestType}</td>
                                <td className="nowrap">{request.status}</td>
                                <td className="nowrap">{(request.requestedAt || "").split("T")[0]}</td>
                                <td className="nowrap">
                                    {request.reviewedAt ? request.reviewedAt.split("T")[0] : "Not reviewed"}
                                </td>
                                <td className="actions-cell nowrap">
                                    <button
                                        className="approve-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReview(request.id, "approved");
                                        }}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReview(request.id, "rejected");
                                        }}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    // 有数据但搜索/过滤后为空：不渲染表头，仅提示；按钮仍保留（因基于 pendingList）
                    pendingList.length > 0 && <p className="no-data">No matching requests</p>
                )
            )}
        </div>
    );
};

export default ManageActivityRequests;
