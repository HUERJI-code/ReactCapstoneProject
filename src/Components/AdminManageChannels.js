import React, { useState, useEffect } from "react";
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

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const res = await api.get("/api/channel/channels/getAll");
            setChannels(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channels:", error?.response || error);
            alert("Failed to fetch channels.");
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

    return (
        <div className="admin-manage-channels-container">
            <h2>Admin Manage Channels</h2>
            <table className="channels-table">
                <thead>
                <tr>
                    <th>Channel ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {channels.map((channel) => (
                    <tr key={channel.channelId} onClick={() => handleRowClick(channel)}>
                        <td>{channel.channelId}</td>
                        <td>{channel.name}</td>
                        <td>{channel.description}</td>
                        <td>{channel.status}</td>
                        <td>
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

            {/* 详情弹窗 */}
            {showDetailsModal && selectedChannel && (
                <div
                    className="details-modal-overlay"
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="details-modal-header">
                            <h3>{selectedChannel.name}</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowDetailsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="details-modal-body">
                            <p>
                                <strong>Description:</strong> {selectedChannel.description}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedChannel.status}
                            </p>
                        </div>
                        <div className="details-modal-footer">
                            <button className="view-messages-btn" onClick={handleViewMessages}>
                                View Channel Messages
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 消息列表弹窗 */}
            {showMessagesModal && selectedChannel && (
                <div
                    className="messages-modal-overlay"
                    onClick={() => setShowMessagesModal(false)}
                >
                    <div className="messages-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                Messages - Channel: {selectedChannel.name} (ID:{" "}
                                {selectedChannel.channelId})
                            </h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowMessagesModal(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="messages-content">
                            {messagesLoading && (
                                <div className="loading">Loading messages...</div>
                            )}
                            {messagesError && <div className="error-text">{messagesError}</div>}
                            {!messagesLoading && !messagesError && messages.length === 0 && (
                                <div className="empty-text">No messages found.</div>
                            )}
                            {!messagesLoading && !messagesError && messages.length > 0 && (
                                <div className="messages-list">
                                    {messages.map((message) => (
                                        <div className="message-item" key={message.id}>
                                            <p>
                                                <strong>Title:</strong> {message.title}
                                            </p>
                                            <p>
                                                <strong>Content:</strong> {message.content}
                                            </p>
                                            <p>
                                                <strong>Posted At:</strong> {message.postedAt}
                                            </p>
                                            <p>
                                                <strong>Status:</strong>{" "}
                                                {message.isVisible ? "Visible" : "Hidden"}
                                            </p>
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
