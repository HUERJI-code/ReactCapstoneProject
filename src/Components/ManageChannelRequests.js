// ManageChannelRequests.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageChannelRequestsCSS.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageChannelRequests = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // 新增：频道详情
    const [channelInfo, setChannelInfo] = useState(null);
    const [loadingChannel, setLoadingChannel] = useState(false);
    const [channelErr, setChannelErr] = useState("");

    // 顶部工具条
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
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
            if (Number.isNaN(d.getTime())) return String(val).split("T")[0] || String(val);
            return d.toISOString().split("T")[0];
        } catch {
            return String(val);
        }
    };

    const handleReview = async (requestId, status, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put("/api/channel/channels/reports/review", null, {
                params: { id: requestId, status }, // ?id=&status=approved|rejected
            });
            alert(`Report ${requestId} has been ${status}.`);
            await fetchReports();
            navigate("/ManageChannelRequests");
        } catch (error) {
            console.error("Failed to review report:", error?.response || error);
            alert("Failed to review report. Please try again.");
        }
    };

    // 新增：获取频道详情
    const fetchChannelInfo = async (channelId) => {
        if (!channelId && channelId !== 0) return;
        setLoadingChannel(true);
        setChannelErr("");
        setChannelInfo(null);
        try {
            // 如果你只想固定用 2 测试，把下面 params 改成 { channelId: 2 }
            const res = await api.get("/channel/getChannelById", {
                params: { channelId },
            });
            setChannelInfo(res.data || null);
        } catch (e) {
            console.error("Failed to fetch channel info:", e?.response || e);
            setChannelErr("Failed to load channel info.");
        } finally {
            setLoadingChannel(false);
        }
    };

    const handleRowClick = (report) => {
        setSelectedReport(report);
        setShowDetailsModal(true);
        fetchChannelInfo(report?.channelId); // 动态按行的 channelId 拉取
    };

    // 仅展示未处理（排除 approved / rejected）
    const pendingReports = useMemo(
        () => (reports || []).filter((r) => r.status !== "approved" && r.status !== "rejected"),
        [reports]
    );

    const filteredReports = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return pendingReports;
        return pendingReports.filter((r) => {
            const id = String(r.id ?? "").toLowerCase();
            const chId = String(r.channelId ?? "").toLowerCase();
            const by = String(r.reportedById ?? "").toLowerCase();
            const status = (r.status || "").toLowerCase();
            const reviewedAt = fmtDate(r.reviewedAt).toLowerCase();
            const createdAt = fmtDate(r.createdAt).toLowerCase();
            return (
                id.includes(q) ||
                chId.includes(q) ||
                by.includes(q) ||
                status.includes(q) ||
                reviewedAt.includes(q) ||
                createdAt.includes(q)
            );
        });
    }, [pendingReports, searchTerm]);

    const overviewStats = useMemo(() => {
        const total = reports.length;
        const pending = pendingReports.length;
        const byStatus = {};
        reports.forEach((r) => {
            const s = (r.status || "Unknown").trim();
            byStatus[s] = (byStatus[s] || 0) + 1;
        });
        return { total, pending, byStatus };
    }, [reports, pendingReports]);

    // 空状态（无 pending request）
    if (!loading && !err && pendingReports.length === 0) {
        return (
            <div className="manage-channel-requests-container">
                <h2>Manage Channel Reports</h2>
                <p className="no-data">No pending channel report</p>
            </div>
        );
    }

    return (
        <div className="manage-channel-requests-container">
            <h2>Manage Channel Reports</h2>

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 工具条：一旦初始 pending 非空，后续搜索为空也不隐藏 */}
            {!loading && pendingReports.length > 0 && (
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
                                placeholder="Search by id / channelId / reporter / status / date..."
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

            {/* 主区：表头仅在过滤后有结果时显示；无结果仅提示 */}
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
                                {Object.keys(overviewStats.byStatus).length === 0 ? (
                                    <span className="badge">No status data</span>
                                ) : (
                                    Object.entries(overviewStats.byStatus).map(([k, v]) => (
                                        <span className="badge" key={k}>
                                            {k}: <b>{v}</b>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : filteredReports.length > 0 ? (
                    <table className="requests-table">
                        <colgroup>
                            <col className="col-id" />
                            <col className="col-channel" />
                            <col className="col-reporter" />
                            <col className="col-status" />
                            <col className="col-date" />
                            <col className="col-actions" />
                        </colgroup>
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
                        {filteredReports.map((r) => (
                            <tr
                                key={r.id}
                                onClick={() => handleRowClick(r)}
                                className="table-not"
                            >
                                <td>{r.id}</td>
                                <td>{r.channelId}</td>
                                <td>{r.reportedById ?? "—"}</td>
                                <td className="nowrap">{r.status}</td>
                                <td className="nowrap">{fmtDate(r.reviewedAt)}</td>
                                <td className="actions-cell nowrap" onClick={(e) => e.stopPropagation()}>
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
                ) : (
                    pendingReports.length > 0 && <p className="no-data">No matching reports</p>
                )
            )}

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
                            {/* 原有 Report 基本信息 */}
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
                            <div className="kv col">
                                <span className="k">Reason:</span>
                                <div className="reason-box">
                                    {selectedReport.reason || "—"}
                                </div>
                            </div>

                            {/* 新增：Channel 信息区域 */}
                            <div className="kv col">
                                <span className="k">Channel Info:</span>
                                <div className="reason-box">
                                    {loadingChannel ? (
                                        "Loading channel info..."
                                    ) : channelErr ? (
                                        channelErr
                                    ) : channelInfo ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <div className="kv">
                                                <span className="k">Name</span>
                                                <span className="v">{channelInfo.name || "—"}</span>
                                            </div>
                                            <div className="kv col">
                                                <span className="k">Description</span>
                                                <div className="reason-box" style={{ marginTop: "6px" }}>
                                                    {channelInfo.description || "—"}
                                                </div>
                                            </div>
                                            <div className="kv">
                                                <span className="k">URL</span>
                                                <span className="v">
                                                    {channelInfo.url ? (
                                                        <a href={channelInfo.url} target="_blank" rel="noreferrer">
                                                            {channelInfo.url}
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        "No channel info."
                                    )}
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
