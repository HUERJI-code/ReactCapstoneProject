// CreateChannel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/CreateChannelCSS.css';

const CreateChannel = () => {
    const [channel, setChannel] = useState({
        name: '',
        url: '',
        description: '',
        tagIds: []
    });
    const [allTags, setAllTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;
    const totalPages = Math.ceil(allTags.length / tagsPerPage);

    useEffect(() => {
        fetchAllTags();
    }, []);

    // Reset to first page whenever modal opens or tags list changes
    useEffect(() => {
        if (showTagModal) {
            setCurrentPage(1);
        }
    }, [showTagModal, allTags]);

    const fetchAllTags = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Tag');
            setAllTags(response.data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const handleInputChange = e => {
        const { name, value } = e.target;
        setChannel({ ...channel, [name]: value });
    };

    const handleTagSelect = tag => {
        if (!selectedTags.some(t => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
            setChannel({
                ...channel,
                tagIds: [...channel.tagIds, tag.tagId]
            });
        }
    };

    const handleTagRemove = tagId => {
        setSelectedTags(selectedTags.filter(t => t.tagId !== tagId));
        setChannel({
            ...channel,
            tagIds: channel.tagIds.filter(id => id !== tagId)
        });
    };

    const handleCreateChannel = async () => {
        try {
            await axios.post('https://localhost:7085/api/Channel/create', channel);
            alert('Create Request Has Been Submitted');
            setChannel({ name: '', url: '', description: '', tagIds: [] });
            setSelectedTags([]);
        } catch (error) {
            console.error('Failed to create channel:', error);
            alert('Failed to create channel. Please try again.');
        }
    };

    // Determine slice of tags for current page
    const startIdx = (currentPage - 1) * tagsPerPage;
    const paginatedTags = allTags.slice(startIdx, startIdx + tagsPerPage);

    return (
        <div className="create-channel-container">
            <div className="create-channel-card">
                <h2>Create Channel</h2>
                <form>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={channel.name}
                            onChange={handleInputChange}
                            placeholder="Enter channel name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={channel.description}
                            onChange={handleInputChange}
                            placeholder="Enter channel description"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>URL</label>
                        <input
                            type="url"
                            name="url"
                            value={channel.url}
                            onChange={handleInputChange}
                            placeholder="Enter channel URL"
                            required
                        />
                    </div>

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

                    <div className="form-actions">
                        <button
                            type="button"
                            className="create-btn"
                            onClick={handleCreateChannel}
                        >
                            Create Channel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChannel;
