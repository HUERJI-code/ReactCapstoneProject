import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/PublishPostCSS.css';

const PublishPost = () => {
    const [channels, setChannels] = useState([]);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [isVisible, setIsVisible] = useState(true); // 默认为可见
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await axios.get('https://localhost:7085/getOrganizerOwnedChannel');
            const approvedChannels = response.data.filter(channel => channel.status === 'approved');
            setChannels(approvedChannels);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
        }
    };

    const handlePublishClick = (channel) => {
        setSelectedChannel(channel);
        setShowPublishModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'title') {
            setPostTitle(value);
        } else if (name === 'content') {
            setPostContent(value);
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (name === 'isPinned') {
            setIsPinned(checked);
        } else if (name === 'isVisible') {
            setIsVisible(checked);
        }
    };

    const handlePublishPost = async () => {
        try {
            setIsSubmitting(true);
            const postToPublish = {
                title: postTitle,
                content: postContent,
                postedAt: "abc", // 固定值
                isPinned: isPinned,
                isVisible: isVisible,
                channelId: selectedChannel.channelId // 假设频道有id
            };
            await axios.post('https://localhost:7085/api/channel/channels/messages', postToPublish);
            alert('Post published successfully!');
            setShowPublishModal(false);
            // 重置表单
            setPostTitle('');
            setPostContent('');
            setIsPinned(false);
            setIsVisible(true);
        } catch (error) {
            console.error("Failed to publish post:", error);
            alert('Failed to publish post. Channel status isn\'t approved.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelPublish = () => {
        setShowPublishModal(false);
        // 重置表单
        setPostTitle('');
        setPostContent('');
        setIsPinned(false);
        setIsVisible(true);
        setSelectedChannel(null);
    };

    return (
        <div className="manage-channels-container">
            <h2>Publish Posts</h2>
            <div className="channels-header">
                <div className="view-options">
                    <button className="overview-btn">📊 Overview</button>
                    <button className="list-btn active">📋 List</button>
                </div>
                <div className="search-customize">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <button className="hide-btn">⨉Hide</button>
                    <div className="customize-dropdown">
                        <button className="customize-btn">customize</button>
                    </div>
                </div>
            </div>

            <div className="channels-table">
                <div className="table-header">
                    <div className="table-cell">Channel Name</div>
                    <div className="table-cell">Description</div>
                    <div className="table-cell">Actions</div>
                </div>
                <div className="table-body">
                    {channels.map(channel => (
                        <div className="table-row" key={channel.id}>
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

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isPinned"
                                        checked={isPinned}
                                        onChange={handleCheckboxChange}
                                    />
                                    Pin this post
                                </label>
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isVisible"
                                        checked={isVisible}
                                        onChange={handleCheckboxChange}
                                    />
                                    Make this post visible
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="update-btn"
                                    onClick={handlePublishPost}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Publishing...' : 'Publish Post'}
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