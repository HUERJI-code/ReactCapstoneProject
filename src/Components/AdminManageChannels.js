// AdminManageChannels.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/AdminManageChannelsCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const AdminManageChannels = () => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // 消息弹窗相关
    const [showMessagesModal, setShowMessagesModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState("");

    // 顶部工具条
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    // 页面加载状态
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetchChannels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchChannels = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/api/channel/channels/getAll");
            setChannels(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channels:", error?.response || error);
            setErr("Failed to fetch channels.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleBanChannel = async (channelId) => {
        try {
            await api.put("/banChannel", null, { params: { channelId } });
            alert("Channel banned successfully!");
            fetchChannels();
        } catch (error) {
            console.error("Failed to ban channel:", error?.response || error);
            alert("Failed to ban channel. Please try again.");
        }
    };

    const handleUnbanChannel = async (channelId) => {
        try {
            await api.put("/unbanChannel", null, { params: { channelId } });
            alert("Channel unbanned successfully!");
            fetchChannels();
        } catch (error) {
            console.error("Failed to unban channel:", error?.response || error);
            alert("Failed to unban channel. Please try again.");
        }
    };

    const handleRowClick = (channel) => {
        setSelectedChannel(channel);
        setShowDetailsModal(true);
    };

    // 获取选中频道的消息
    const fetchChannelMessages = async (channelId) => {
        setMessages([]);
        setMessagesError("");
        setMessagesLoading(true);
        try {
            const res = await api.get("/api/channel/channels/getChannelMessages", {
                params: { channelId },
            });
            setMessages(res.data || []);
        } catch (err) {
            console.error("Failed to fetch channel messages:", err?.response || err);
            setMessagesError("Failed to fetch channel messages. Please try again.");
        } finally {
            setMessagesLoading(false);
        }
    };

    // 点击 “View Channel Messages”
    const handleViewMessages = async () => {
        if (!selectedChannel) return;
        setShowMessagesModal(true);
        await fetchChannelMessages(selectedChannel.channelId);
    };

    // 模糊搜索：id/name/description/status
    const filteredChannels = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return channels;
        return channels.filter((c) => {
            const idStr = `${c.channelId ?? ""}`.toLowerCase();
            const name = (c.name || "").toLowerCase();
            const desc = (c.description || "").toLowerCase();
            const status = (c.status || "").toLowerCase();
            return (
                idStr.includes(q) ||
                name.includes(q) ||
                desc.includes(q) ||
                status.includes(q)
            );
        });
    }, [channels, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = channels.length;
        const statusMap = {};
        channels.forEach((c) => {
            const s = (c.status || "Unknown").trim();
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        return { total, statusMap };
    }, [channels]);

    // ===== 空状态（初始加载为空）—— 不显示工具条/表格 =====
    if (!loading && !err && loaded && channels.length === 0) {
        return (
            <div className="admin-manage-channels-container">
                <h2>Admin Manage Channels</h2>
                <p className="no-channel">no channel</p>
            </div>
        );
    }

    return (
        <div className="admin-manage-channels-container">
            <h2>Admin Manage Channels</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：只要初始非空（channels.length > 0），之后搜索为空也不隐藏 */}
            {!loading && channels.length > 0 && (
                <div className="channels-header">
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
                                placeholder="Search by id / name / description / status..."
                                className="search-input"
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

            {/* 主区域：过滤后有结果才渲染表格（含表头）；否则仅提示，不渲染表头 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total Channels</div>
                            <div className="overview-number">{overviewStats.total}</div>
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
                ) : filteredChannels.length > 0 ? (
                    <table className="channels-table">
                        {/* 固定列宽，保证对齐 */}
                        <colgroup>
                            <col className="col-id" />
                            <col className="col-name" />
                            <col className="col-desc" />
                            <col className="col-status" />
                            <col className="col-actions" />
                        </colgroup>

                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredChannels.map((channel) => (
                            <tr
                                key={channel.channelId}
                                onClick={() => handleRowClick(channel)}
                                className="table-not"
                            >
                                <td className="cell-id">{channel.channelId}</td>
                                <td title={channel.name}>{channel.name}</td>
                                <td title={channel.description}>{channel.description}</td>
                                <td className="cell-status">{channel.status}</td>
                                <td className="cell-actions">
                                    {channel.status !== "banned" ? (
                                        <button
                                            className="ban-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBanChannel(channel.channelId);
                                            }}
                                        >
                                            Ban
                                        </button>
                                    ) : (
                                        <button
                                            className="unban-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnbanChannel(channel.channelId);
                                            }}
                                        >
                                            Unban
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    channels.length > 0 && <p className="no-data">No matching channels</p>
                )
            )}

            {/* 详情弹窗（已统一为 report-details-modal 风格，并追加 URL） */}
            {showDetailsModal && selectedChannel && (
                <div
                    className="report-details-modal-overlay"
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div
                        className="report-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Channel Details</h3>
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
                            <div className="kv">
                                <div className="k">Channel ID</div>
                                <div className="v">{selectedChannel.channelId}</div>
                            </div>
                            <div className="kv">
                                <div className="k">Name</div>
                                <div className="v">{selectedChannel.name || "-"}</div>
                            </div>
                            <div className="kv">
                                <div className="k">Status</div>
                                <div className="v">{selectedChannel.status || "-"}</div>
                            </div>
                            <div className="kv">
                                <div className="k">URL</div>
                                <div className="v">
                                    {selectedChannel.url ? (
                                        <a
                                            href={selectedChannel.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={selectedChannel.url}
                                        >
                                            {selectedChannel.url}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </div>
                            </div>
                            <div className="kv col">
                                <div className="k">Description</div>
                                <div className="reason-box">
                                    {selectedChannel.description || "-"}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="back-btn" onClick={() => setShowDetailsModal(false)}>
                                Back
                            </button>
                            <button className="view-messages-btn" onClick={handleViewMessages}>
                                View Channel Messages
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 消息列表弹窗（保持原样） */}
            {showMessagesModal && selectedChannel && (
                <div
                    className="messages-modal-overlay"
                    onClick={() => setShowMessagesModal(false)}
                >
                    <div className="messages-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                Messages - Channel: {selectedChannel.name} (ID: {selectedChannel.channelId})
                            </h3>
                            <button className="close-btn" onClick={() => setShowMessagesModal(false)}>
                                &times;
                            </button>
                        </div>

                        <div className="messages-content">
                            {messagesLoading && <div className="loading">Loading messages...</div>}
                            {messagesError && <div className="error-text">{messagesError}</div>}
                            {!messagesLoading && !messagesError && messages.length === 0 && (
                                <div className="empty-text">No messages found.</div>
                            )}
                            {!messagesLoading && !messagesError && messages.length > 0 && (
                                <div className="messages-list">
                                    {messages.map((message) => (
                                        <div className="message-item" key={message.id}>
                                            <p><strong>Title:</strong> {message.title}</p>
                                            <p><strong>Content:</strong> {message.content}</p>
                                            <p><strong>Posted At:</strong> {message.postedAt}</p>
                                            <p><strong>Status:</strong> {message.isVisible ? "Visible" : "Hidden"}</p>
                                            <hr />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="refresh-btn"
                                onClick={() => fetchChannelMessages(selectedChannel.channelId)}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageChannels;
