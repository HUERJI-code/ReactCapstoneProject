// ManageChannelCreateRequest.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageChannelCreateRequestCSS.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageChannelCreateRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // 顶部工具条
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getChannelRequests");
            let data = res.data || [];
            // 按 requestedAt 从早到晚排序
            data.sort((a, b) => new Date(a.requestedAt) - new Date(b.requestedAt));
            setRequests(data);
        } catch (e) {
            console.error("Failed to fetch channel create requests:", e?.response || e);
            setErr("Failed to fetch channel create requests.");
            if (e?.response?.status === 401) navigate("/adminLogin");
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (requestId, status) => {
        try {
            await api.put(`/api/channel/review/${requestId}`, null, {
                params: { status }, // ?status=approved / rejected
            });
            alert(`Request ${requestId} has been ${status}.`);
            await fetchRequests();
            navigate("/ManageChannelCreateRequest");
        } catch (error) {
            console.error("Failed to review request:", error?.response || error);
            alert("Failed to review request. Please try again.");
        }
    };

    // 仅保留 pending（用于列表显示）
    const pending = useMemo(
        () => (requests || []).filter((r) => (r.status || "").toLowerCase() === "pending"),
        [requests]
    );

    // 模糊搜索：id / channel name / description / requestedBy(user.name) / date / status
    const filtered = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return pending;
        return pending.filter((r) => {
            const id = String(r.id ?? "").toLowerCase();
            const name = (r.channel?.name || "").toLowerCase();
            const desc = (r.channel?.description || "").toLowerCase();
            const user = (r.user?.name || "").toLowerCase();
            const date = ((r.requestedAt || "").split("T")[0] || "").toLowerCase();
            const status = (r.status || "").toLowerCase();
            return (
                id.includes(q) ||
                name.includes(q) ||
                desc.includes(q) ||
                user.includes(q) ||
                date.includes(q) ||
                status.includes(q)
            );
        });
    }, [pending, searchTerm]);

    // Overview 统计（基于全部请求）
    const overviewStats = useMemo(() => {
        const total = requests.length;
        const byStatus = {};
        requests.forEach((r) => {
            const s = (r.status || "Unknown").trim();
            byStatus[s] = (byStatus[s] || 0) + 1;
        });
        const pendingCount = byStatus["pending"] || 0;
        return { total, pending: pendingCount, byStatus };
    }, [requests]);

    // 空状态（无任何 pending）
    if (!loading && !err && pending.length === 0) {
        return (
            <div className="manage-channel-create-requests-container">
                <h2 style={{ textAlign: "center" }}>Manage Channel Create Requests</h2>
                <p className="no-data">no pending requests</p>
            </div>
        );
    }

    return (
        <div className="manage-channel-create-requests-container">
            <h2>Manage Channel Requests</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：仅在“非加载中”且“有数据”时显示 */}
            {!loading && requests.length > 0 && (
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
                                placeholder="Search by id / channel name / desc / user / date / status..."
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

            {!loading && !err && (
                <>
                    {showOverview ? (
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
                                    {Object.keys(overviewStats.byStatus).length === 0 ? (
                                        <span className="badge">No status data</span>
                                    ) : (
                                        Object.entries(overviewStats.byStatus).map(([k, v]) => (
                                            <span key={k} className="badge">
                        {k}: <b>{v}</b>
                      </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <table className="requests-table">
                            {/* 固定列宽，严格对齐 */}
                            <colgroup>
                                <col className="col-id" />
                                <col className="col-name" />
                                <col className="col-desc" />
                                <col className="col-user" />
                                <col className="col-date" />
                                <col className="col-actions" />
                            </colgroup>

                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Channel Name</th>
                                <th>Description</th>
                                <th>Requested By</th>
                                <th>Requested At</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            {filtered.length === 0 ? (
                                <tbody>
                                <tr>
                                    <td colSpan="6" className="table-empty">
                                        No matching requests
                                    </td>
                                </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                {filtered.map((r) => (
                                    <tr key={r.id} className="table-not">
                                        <td>{r.id}</td>
                                        <td className="limit-text" title={r.channel?.name}>
                                            {r.channel?.name || "—"}
                                        </td>
                                        <td className="limit-text" title={r.channel?.description}>
                                            {r.channel?.description || "—"}
                                        </td>
                                        <td>{r.user?.name ?? "—"}</td>
                                        <td className="nowrap">{(r.requestedAt || "").split("T")[0]}</td>
                                        <td className="actions-cell nowrap">
                                            <button
                                                className="approve-btn"
                                                onClick={() => handleReview(r.id, "approved")}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => handleReview(r.id, "rejected")}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            )}
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageChannelCreateRequest;
