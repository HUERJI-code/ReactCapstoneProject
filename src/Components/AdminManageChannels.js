import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/AdminManageChannelsCSS.css';

const AdminManageChannels = () => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // 新增：消息弹窗相关
    const [showMessagesModal, setShowMessagesModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState('');

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/channel/channels/getAll');
            setChannels(response.data);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        }
    };

    const handleBanChannel = async (channelId) => {
        try {
            await axios.put(`https://localhost:7085/banChannel?channelId=${channelId}`);
            alert('Channel banned successfully!');
            fetchChannels(); // Refresh channels list after ban
        } catch (error) {
            console.error('Failed to ban channel:', error);
            alert('Failed to ban channel. Please try again.');
        }
    };

    const handleUnbanChannel = async (channelId) => {
        try {
            await axios.put(`https://localhost:7085/unbanChannel?channelId=${channelId}`);
            alert('Channel unbanned successfully!');
            fetchChannels(); // Refresh channels list after unban
        } catch (error) {
            console.error('Failed to unban channel:', error);
            alert('Failed to unban channel. Please try again.');
        }
    };

    const handleRowClick = (channel) => {
        setSelectedChannel(channel);
        setShowDetailsModal(true);
    };

    // 新增：获取选中频道的消息
    const fetchChannelMessages = async (channelId) => {
        setMessages([]);
        setMessagesError('');
        setMessagesLoading(true);
        try {
            const res = await axios.get(
                `https://localhost:7085/api/channel/channels/getChannelMessages?channelId=${channelId}`
            );
            setMessages(res.data || []);
        } catch (err) {
            console.error('Failed to fetch channel messages:', err);
            setMessagesError('Failed to fetch channel messages. Please try again.');
        } finally {
            setMessagesLoading(false);
        }
    };

    // 新增：点击“View Channel Messages”
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
                            {channel.status !== 'banned' ? (
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
                <div className="details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="details-modal-header">
                            <h3>{selectedChannel.name}</h3>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
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
                <div className="messages-modal-overlay" onClick={() => setShowMessagesModal(false)}>
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
                                                <strong>Status:</strong> {message.isVisible ? 'Visible' : 'Hidden'}
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
