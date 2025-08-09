import React, { useState, useEffect } from "react";
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
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const res = await api.get("/getOrganizerOwnedChannel");
            setChannels(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channels:", error?.response || error);
        }
    };

    const fetchChannelMessages = async (channelId) => {
        try {
            const res = await api.get("/api/channel/channels/getChannelMessages", {
                params: { channelId },
            });
            setMessages(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channel messages:", error?.response || error);
        }
    };

    const handleViewHistoryClick = (channelId) => {
        setSelectedChannelId(channelId);
        setShowHistoryModal(true);
        fetchChannelMessages(channelId);
    };

    return (
        <div className="view-channel-post-container">
            <h2>View Channel Posts</h2>
            <div className="channels-table">
                <div className="table-header">
                    <div className="table-cell">Channel Name</div>
                    <div className="table-cell">Description</div>
                    <div className="table-cell">Actions</div>
                </div>
                <div className="table-body">
                    {channels.map((channel) => {
                        const cid = channel.channelId ?? channel.id; // 兼容两种字段
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

            {showHistoryModal && selectedChannelId && (
                <div className="history-modal-overlay">
                    <div className="history-modal">
                        <div className="modal-header">
                            <h3>Posts History - Channel ID: {selectedChannelId}</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="messages-list">
                            {messages.map((m) => (
                                <div className="message-item" key={m.id}>
                                    <p>
                                        <strong>Title:</strong> {m.title}
                                    </p>
                                    <p>
                                        <strong>Content:</strong> {m.content}
                                    </p>
                                    <p>
                                        <strong>Posted At:</strong> {m.postedAt}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {m.isVisible ? "Visible" : "Hidden"}
                                    </p>
                                    <hr />
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="empty-text">No messages found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewChannelPost;
