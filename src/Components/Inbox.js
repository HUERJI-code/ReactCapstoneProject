import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ComponentsCSS/InboxCSS.css';
import { useNavigate } from 'react-router-dom';

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
            const response = await axios.get('https://localhost:7085/getLoginUserMessage');
            setMessages(response.data.sort((a, b) => {
                if (a.isRead !== b.isRead) {
                    return a.isRead - b.isRead; // 0 排在前面
                }
                return b.id - a.id; // 同为 0 时按 id 降序排列
            }));
            setError(null);
        } catch (err) {
            setError('Failed to fetch messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMessageClick = (message) => {
        // 创建一个新的消息数组，更新选定消息的 isRead 状态
        const updatedMessages = messages.map(msg =>
            msg.id === message.id ? { ...msg, isRead: true } : msg
        );
        setMessages(updatedMessages);
        const markAsRead = async () => {
            try {
                await axios.post(`https://localhost:7085/MarkAsRead/${message.id}`);
                // 或者使用 params 参数传递
                // await axios.get('https://localhost:7085/MarkAsRead', { params: { id: message.id } });
            } catch (error) {
                console.error("Failed to mark message as read:", error);
            }
        };

        markAsRead();

        // 显示消息详情
        setSelectedMessage(message);
        setShowDetails(true);

    };

    const closeDetails = () => {
        setShowDetails(false);
    };

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
                        {message.isRead === false && (
                            <div className="unread-dot"></div>
                        )}
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
                    <div className="message-details-card" onClick={(e) => e.stopPropagation()}>
                        <div className="message-details-header">
                            <h3>Message Details</h3>
                            <button className="close-button" onClick={closeDetails}>×</button>
                        </div>
                        <div className="message-details-content">
                            <p><strong>ID:</strong> {selectedMessage.id}</p>
                            <p><strong>Timestamp:</strong> {selectedMessage.sentAt}</p>
                            <p><strong>Title:</strong> {selectedMessage.title}</p>
                            <p><strong>Content:</strong> {selectedMessage.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inbox;