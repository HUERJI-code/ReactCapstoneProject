import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ComponentsCSS/InboxCSS.css";
import { useNavigate } from "react-router-dom";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await api.get("/getLoginUserMessage");
            const sorted = res.data.sort((a, b) => {
                if (a.isRead !== b.isRead) return a.isRead - b.isRead; // 未读优先
                return b.id - a.id; // id 降序
            });
            setMessages(sorted);
            setError(null);
        } catch (err) {
            setError("Failed to fetch messages");
            console.error(err?.response || err);
            if (err?.response?.status === 401) {
                navigate("/OrganizerLogin"); // 未登录 → 登录页
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMessageClick = (message) => {
        // 本地先标记为已读
        setMessages((prev) =>
            prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
        );

        // 后端标记已读
        api.post(`/MarkAsRead/${message.id}`).catch((error) => {
            console.error("Failed to mark message as read:", error?.response || error);
        });

        setSelectedMessage(message);
        setShowDetails(true);
    };

    const closeDetails = () => setShowDetails(false);

    return (
        <div className="inbox-container">
            <h2>Inbox</h2>
            {loading && <div className="loading">Loading messages...</div>}
            {error && <div className="error">{error}</div>}

            <div className="messages-list">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="message-card"
                        onClick={() => handleMessageClick(message)}
                    >
                        {message.isRead === false && <div className="unread-dot"></div>}
                        <div className="message-header">
                            <span className="messageId">{message.id}</span>
                            <span className="timestamp">{message.sentAt}</span>
                        </div>
                        <div className="message-subject">{message.title}</div>
                        <div className="message-preview">{message.content}</div>
                    </div>
                ))}
            </div>

            {/* 消息详情浮动框 */}
            {showDetails && selectedMessage && (
                <div className="message-details-overlay" onClick={closeDetails}>
                    <div
                        className="message-details-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="message-details-header">
                            <h3>Message Details</h3>
                            <button className="close-button" onClick={closeDetails}>
                                ×
                            </button>
                        </div>
                        <div className="message-details-content">
                            <p>
                                <strong>ID:</strong> {selectedMessage.id}
                            </p>
                            <p>
                                <strong>Timestamp:</strong> {selectedMessage.sentAt}
                            </p>
                            <p>
                                <strong>Title:</strong> {selectedMessage.title}
                            </p>
                            <p>
                                <strong>Content:</strong> {selectedMessage.content}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inbox;
