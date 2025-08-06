import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/AdminManageChannelsCSS.css';

const AdminManageChannels = () => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/channel/channels/getAll');
            setChannels(response.data);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
        }
    };

    const handleBanChannel = async (channelId) => {
        try {
            await axios.put(`https://localhost:7085/banChannel?channelId=${channelId}`);
            alert('Channel banned successfully!');
            fetchChannels(); // Refresh channels list after ban
        } catch (error) {
            console.error("Failed to ban channel:", error);
            alert('Failed to ban channel. Please try again.');
        }
    };

    const handleUnbanChannel = async (channelId) => {
        try {
            await axios.put(`https://localhost:7085/unbanChannel?channelId=${channelId}`);
            alert('Channel unbanned successfully!');
            fetchChannels(); // Refresh channels list after unban
        } catch (error) {
            console.error("Failed to unban channel:", error);
            alert('Failed to unban channel. Please try again.');
        }
    };

    const handleRowClick = (channel) => {
        setSelectedChannel(channel);
        setShowDetailsModal(true);
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
                {channels.map(channel => (
                    <tr key={channel.channelId} onClick={() => handleRowClick(channel)}>
                        <td>{channel.channelId}</td>
                        <td>{channel.name}</td>
                        <td>{channel.description}</td>
                        <td>{channel.status}</td>
                        <td>
                            {channel.status !== 'banned' ? (
                                <button className="ban-button"
                                        onClick={(e) => {
                                            handleBanChannel(channel.channelId);
                                            e.stopPropagation();
                                        }}
                                >
                                    Ban
                                </button>
                            ) : (
                                <button className="unban-button"
                                        onClick={(e) => {
                                            handleUnbanChannel(channel.channelId);
                                            e.stopPropagation();
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

            {showDetailsModal && selectedChannel && (
                <div className="details-modal-overlay">
                    <div className="details-modal">
                        <h3>{selectedChannel.name}</h3>
                        <p><strong>Description:</strong> {selectedChannel.description}</p>
                        <p><strong>Status:</strong> {selectedChannel.status}</p>
                        <button onClick={() => setShowDetailsModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageChannels;