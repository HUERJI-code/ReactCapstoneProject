// PublishPost.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/PublishPostCSS.css";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const PublishPost = () => {
    const [channels, setChannels] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 搜索/视图切换/隐藏搜索条
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    // loading / err
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getOrganizerOwnedChannel");
            const approved = (res.data || []).filter((c) => c.status === "approved");
            setChannels(approved);
        } catch (error) {
            console.error("Failed to fetch channels:", error?.response || error);
            setErr("Failed to fetch channels.");
            setChannels([]);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handlePublishClick = (channel) => {
        setSelectedChannel(channel);
        setShowPublishModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "title") setPostTitle(value);
        if (name === "content") setPostContent(value);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (name === "isPinned") setIsPinned(checked);
        if (name === "isVisible") setIsVisible(checked);
    };

    const handlePublishPost = async () => {
        if (!selectedChannel) return;
        try {
            setIsSubmitting(true);
            const channelId = selectedChannel.channelId ?? selectedChannel.id;

            const postToPublish = {
                title: postTitle,
                content: postContent,
                isPinned,
                isVisible,
                channelId,
            };

            await api.post("/api/channel/channels/messages", postToPublish);
            alert("Post published successfully!");
            setShowPublishModal(false);

            // reset
            setPostTitle("");
            setPostContent("");
            setIsPinned(false);
            setIsVisible(true);
            setSelectedChannel(null);
        } catch (error) {
            console.error("Failed to publish post:", error?.response || error);
            alert("Failed to publish post. Channel status isn't approved or session expired.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelPublish = () => {
        setShowPublishModal(false);
        setPostTitle("");
        setPostContent("");
        setIsPinned(false);
        setIsVisible(true);
        setSelectedChannel(null);
    };

    // 模糊搜索（name / description / url / status）
    const filteredChannels = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return channels;
        return channels.filter((ch) => {
            const name = (ch.name || "").toLowerCase();
            const desc = (ch.description || "").toLowerCase();
            const url = (ch.url || "").toLowerCase();
            const status = (ch.status || "").toLowerCase();
            return (
                name.includes(q) ||
                desc.includes(q) ||
                url.includes(q) ||
                status.includes(q)
            );
        });
    }, [channels, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = channels.length;
        const statusMap = {};
        channels.forEach((c) => {
            const st = (c.status || "Unknown").trim();
            statusMap[st] = (statusMap[st] || 0) + 1;
        });
        return { total, statusMap };
    }, [channels]);

    // 空状态
    if (!loading && !err && loaded && channels.length === 0) {
        return (
            <div className="manage-channels-container">
                <h2>Publish Posts</h2>
                <p className="no-channel">no channel to publish</p>
            </div>
        );
    }

    return (
        <div className="manage-channels-container">
            <h2>Publish Posts</h2>

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

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
                    <div className="search-customize">
                        {showSearchBar && (
                            <input
                                type="text"
                                placeholder="Search by name / description / url / status..."
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

            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Approved Channels</div>
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
                            {filteredChannels.map((channel) => (
                                <div className="table-row" key={channel.id ?? channel.channelId}>
                                    <div className="table-cell">{channel.name}</div>
                                    <div className="table-cell">{channel.description}</div>
                                    <div className="table-cell">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handlePublishClick(channel)}
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    channels.length > 0 && <p className="no-data">No matching channels</p>
                )
            )}

            {showPublishModal && selectedChannel && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>Publish Post to {selectedChannel.name}</h3>
                        <form>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={postTitle}
                                    onChange={handleInputChange}
                                    placeholder="Enter post title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    name="content"
                                    value={postContent}
                                    onChange={handleInputChange}
                                    placeholder="Enter post content"
                                    required
                                />
                            </div>

                            {/* ✅ 合并为同一行并与复选框贴靠 */}
                            <div className="form-group checkbox-inline">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isPinned"
                                        checked={isPinned}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span>Pin this post</span>
                                </label>

                                <label>
                                    <input
                                        type="checkbox"
                                        name="isVisible"
                                        checked={isVisible}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span>Make this post visible</span>
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="update-btn"
                                    onClick={handlePublishPost}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Publishing..." : "Publish Post"}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancelPublish}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublishPost;
