import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ViewChannelPostCSS.css';

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
            const response = await axios.get('https://localhost:7085/getOrganizerOwnedChannel');
            setChannels(response.data);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
        }
    };

    const fetchChannelMessages = async (channelId) => {
        try {
            console.log(channelId);
            const response = await axios.get(
                `https://localhost:7085/api/channel/channels/getChannelMessages?channelId=${channelId}`
            );
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to fetch channel messages:", error);
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
                    {channels.map(channel => (
                        <div className="table-row" key={channel.channelId}>
                            <div className="table-cell">{channel.name}</div>
                            <div className="table-cell">{channel.description}</div>
                            <div className="table-cell">
                                <button
                                    className="view-history-btn"
                                    onClick={() => handleViewHistoryClick(channel.channelId)}
                                >
                                    View History Post
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showHistoryModal && selectedChannelId && (
                <div className="history-modal-overlay">
                    <div className="history-modal">
                        <div className="modal-header">
                            <h3>Posts History - Channel ID: {selectedChannelId}</h3>
                            <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="messages-list">
                            {messages.map(message => (
                                <div className="message-item" key={message.id}>
                                    <p><strong>Title:</strong> {message.title}</p>
                                    <p><strong>Content:</strong> {message.content}</p>
                                    <p><strong>Posted At:</strong> {message.postedAt}</p>
                                    <p><strong>Status:</strong> {message.isVisible ? 'Visible' : 'Hidden'}</p>
                                    <hr />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewChannelPost;