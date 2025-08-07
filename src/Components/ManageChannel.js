// ManageChannel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageChannelCSS.css';

const ManageChannel = () => {
    const [channels, setChannels] = useState([]);
    const [editingChannel, setEditingChannel] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);

    // Pagination state for tag modal
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;
    const totalPages = Math.ceil(allTags.length / tagsPerPage);

    useEffect(() => {
        fetchChannels();
        fetchAllTags();
    }, []);

    // Reset to first page whenever tag modal opens or tag list changes
    useEffect(() => {
        if (showTagModal) {
            setCurrentPage(1);
        }
    }, [showTagModal, allTags]);

    const fetchChannels = async () => {
        try {
            const response = await axios.get('https://localhost:7085/getOrganizerOwnedChannel');
            setChannels(response.data);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
        }
    };

    const fetchAllTags = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Tag');
            setAllTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleEditClick = (channel) => {
        const tagIds = channel.tags ? channel.tags.map(tag => tag.tagId) : [];
        setSelectedTags(
            tagIds.map(id => allTags.find(t => t.tagId === id)).filter(Boolean)
        );
        setEditingChannel(channel);
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingChannel({ ...editingChannel, [name]: value });
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some(t => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags(selectedTags.filter(tag => tag.tagId !== tagId));
    };

    const handleUpdateChannel = async () => {
        try {
            const { channelId, name, url, description } = editingChannel;
            const channelToUpdate = {
                id: channelId,
                name,
                url,
                description,
                tagIds: selectedTags.map(tag => tag.tagId)
            };
            await axios.post('https://localhost:7085/updateChannel', channelToUpdate);
            alert('Channel updated successfully!');
            setShowEditModal(false);
            fetchChannels();
        } catch (error) {
            console.error("Failed to update channel:", error);
            alert('Failed to update channel. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingChannel(null);
        setSelectedTags([]);
    };

    // Slice tags for current page
    const startIdx = (currentPage - 1) * tagsPerPage;
    const paginatedTags = allTags.slice(startIdx, startIdx + tagsPerPage);

    return (
        <div className="manage-channels-container">
            <h2>Manage Channels</h2>

            <div className="channels-header">
                <div className="view-options">
                    <button className="overview-btn">📊 Overview</button>
                    <button className="list-btn active">📋 List</button>
                </div>
                <div className="search-customize">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <button className="hide-btn">⨉Hide</button>
                    <div className="customize-dropdown">
                        <button className="customize-btn">Customize</button>
                    </div>
                </div>
            </div>

            <div className="channels-table">
                <div className="table-header">
                    <div className="table-cell">Channel Name</div>
                    <div className="table-cell">URL</div>
                    <div className="table-cell">Description</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                </div>
                <div className="table-body">
                    {channels.map(ch => (
                        <div className="table-row" key={ch.id}>
                            <div className="table-cell">{ch.name}</div>
                            <div className="table-cell">{ch.url}</div>
                            <div className="table-cell">{ch.description}</div>
                            <div className="table-cell">{ch.status}</div>
                            <div className="table-cell">
                                <button className="edit-btn" onClick={() => handleEditClick(ch)}>
                                    Edit
                                </button>
                                <button className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showEditModal && editingChannel && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>Edit Channel</h3>
                        <form>
                            {/* Name */}
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingChannel.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={editingChannel.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* URL */}
                            <div className="form-group">
                                <label>URL</label>
                                <input
                                    type="url"
                                    name="url"
                                    value={editingChannel.url}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Tags */}
                            <div className="tag-section">
                                <label>Tags</label>
                                <div className="tag-container">
                                    {selectedTags.map(tag => (
                                        <span key={tag.tagId} className="selected-tag">
                      {tag.name}
                                            <button
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleTagRemove(tag.tagId)}
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-tag-btn"
                                        onClick={() => setShowTagModal(true)}
                                    >
                                        Add Tag
                                    </button>
                                </div>
                            </div>

                            {/* Tag-selection modal */}
                            {showTagModal && (
                                <div className="tag-modal-overlay">
                                    <div className="tag-modal">
                                        <h3>Please select your channel tags</h3>
                                        <div className="tags-container">
                                            {paginatedTags.map(tag => (
                                                <div
                                                    key={tag.tagId}
                                                    className={`tag-item ${
                                                        selectedTags.some(t => t.tagId === tag.tagId)
                                                            ? 'selected'
                                                            : ''
                                                    }`}
                                                    onClick={() => handleTagSelect(tag)}
                                                >
                                                    {tag.name}
                                                </div>
                                            ))}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="pagination">
                                                <button
                                                    type="button"
                                                    className="page-btn"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    ‹
                                                </button>
                                                <span className="page-info">
                          Page {currentPage} / {totalPages}
                        </span>
                                                <button
                                                    type="button"
                                                    className="page-btn"
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        )}

                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="back-btn"
                                                onClick={() => setShowTagModal(false)}
                                            >
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form actions */}
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="update-btn"
                                    onClick={handleUpdateChannel}
                                >
                                    Update Channel
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCancelEdit}
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

export default ManageChannel;
