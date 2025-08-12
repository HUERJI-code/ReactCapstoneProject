// ViewChannelPost.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/ViewChannelPostCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ViewChannelPost = () => {
    const [channels, setChannels] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesErr, setMessagesErr] = useState("");

    // 视图与搜索
    const [showOverview, setShowOverview] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearchBar, setShowSearchBar] = useState(true);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getOrganizerOwnedChannel");
            setChannels(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channels:", error?.response || error);
            setErr("Failed to fetch channels.");
            setChannels([]);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const fetchChannelMessages = async (channelId) => {
        setMessages([]);
        setMessagesErr("");
        setMessagesLoading(true);
        try {
            const res = await api.get("/api/channel/channels/getChannelMessages", {
                params: { channelId },
            });
            setMessages(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channel messages:", error?.response || error);
            setMessagesErr("Failed to fetch channel messages.");
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleViewHistoryClick = (channelId) => {
        setSelectedChannelId(channelId);
        setShowHistoryModal(true);
        fetchChannelMessages(channelId);
    };

    // ===== Hooks 计算 =====
    const filteredChannels = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return channels;
        return channels.filter((c) => {
            const name = (c.name || "").toLowerCase();
            const desc = (c.description || "").toLowerCase();
            const url = (c.url || "").toLowerCase();
            const status = (c.status || "").toLowerCase();
            return (
                name.includes(q) ||
                desc.includes(q) ||
                url.includes(q) ||
                status.includes(q)
            );
        });
    }, [channels, searchTerm]);

    const overviewStats = useMemo(() => {
        const total = channels.length;
        const statusMap = {};
        channels.forEach((c) => {
            const s = (c.status || "Unknown").trim();
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        return { total, statusMap };
    }, [channels]);

    // ===== 空状态（初始加载完成且没有频道）—— 不显示工具条/列表 =====
    if (!loading && !err && loaded && channels.length === 0) {
        return (
            <div className="view-channel-post-container">
                <h2>View Channel Posts</h2>
                <p className="no-channel">no channel</p>
            </div>
        );
    }

    return (
        <div className="view-channel-post-container">
            <h2>View Channel Posts</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：只要初始非空（channels.length > 0），搜索为空也不隐藏 */}
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
                                className="search-input"
                                placeholder="Search by name / description / url / status..."
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

            {/* 主体区域 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total Channels</div>
                            <div className="overview-number">{overviewStats.total}</div>
                        </div>
                        <div className="overview-card wide">
                            <div className="overview-title">By Status</div>
                            <div className="status-list">
                                {Object.keys(overviewStats.statusMap).length === 0 ? (
                                    <span className="status-item">No status data</span>
                                ) : (
                                    Object.entries(overviewStats.statusMap).map(([k, v]) => (
                                        <span key={k} className="status-item">
                      {k}: <b>{v}</b>
                    </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : filteredChannels.length > 0 ? (
                    <div className="channels-table">
                        <div className="table-header">
                            <div className="table-cell">Channel Name</div>
                            <div className="table-cell">Description</div>
                            <div className="table-cell">Actions</div>
                        </div>
                        <div className="table-body">
                            {filteredChannels.map((channel) => {
                                const cid = channel.channelId ?? channel.id;
                                return (
                                    <div className="table-row" key={cid}>
                                        <div className="table-cell">{channel.name}</div>
                                        <div className="table-cell">{channel.description}</div>
                                        <div className="table-cell">
                                            <button
                                                className="view-history-btn"
                                                onClick={() => handleViewHistoryClick(cid)}
                                            >
                                                View History Post
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    channels.length > 0 && (
                        <p className="no-data">No matching channels</p>
                    )
                )
            )}

            {/* 历史消息弹窗 */}
            {showHistoryModal && selectedChannelId && (
                <div className="history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Posts History - Channel ID: {selectedChannelId}</h3>
                            <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
                                &times;
                            </button>
                        </div>

                        {messagesLoading && <div className="loading">Loading messages...</div>}
                        {messagesErr && <div className="error-text">{messagesErr}</div>}

                        {!messagesLoading && !messagesErr && (
                            <div className="messages-list">
                                {messages.length === 0 ? (
                                    <div className="empty-text">No messages found.</div>
                                ) : (
                                    messages.map((m) => (
                                        <div className="message-item" key={m.id}>
                                            <p><strong>Title:</strong> {m.title}</p>
                                            <p><strong>Content:</strong> {m.content}</p>
                                            <p><strong>Posted At:</strong> {m.postedAt}</p>
                                            <p><strong>Status:</strong> {m.isVisible ? "Visible" : "Hidden"}</p>
                                            <hr />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewChannelPost;
