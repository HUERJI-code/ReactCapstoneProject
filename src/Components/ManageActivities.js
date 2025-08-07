import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageActivitiesCSS.css';

const ManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [tags, setTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);

    useEffect(() => {
        fetchActivities();
        fetchAllTags();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Activity');
            setActivities(response.data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
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

    const handleEditClick = (activity) => {
        // 提取标签ID
        const tagIds = activity.tags ? activity.tags.map(tag => tag.tagId) : [];
        setSelectedTags(tagIds.map(tagId => allTags.find(tag => tag.tagId === tagId)));
        setEditingActivity(activity);
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startTime' || name === 'endTime') {
            if (value) {
                const dateTimeStr = value + ':00.000Z';
                setEditingActivity({
                    ...editingActivity,
                    [name]: dateTimeStr
                });
            } else {
                setEditingActivity({
                    ...editingActivity,
                    [name]: ''
                });
            }
        } else {
            setEditingActivity({
                ...editingActivity,
                [name]: value
            });
        }
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some(t => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags(selectedTags.filter(tag => tag.tagId !== tagId));
    };

    const handleUpdateActivity = async () => {
        try {
            const activityToUpdate = {
                ...editingActivity,
                tagIds: selectedTags.map(tag => tag.tagId)
            };

            await axios.put(`https://localhost:7085/api/Activity/update/${editingActivity.activityId}`, activityToUpdate);
            alert('Activity updated successfully!');
            setShowEditModal(false);
            fetchActivities();
        } catch (error) {
            console.error("Failed to update activity:", error);
            alert('Failed to update activity. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingActivity(null);
        setSelectedTags([]);
    };

    return (
        <div className="manage-activities-container">
            <h2>My Activities</h2>
            <div className="activities-header">
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

            <div className="activities-table">
                <div className="table-header">
                    <div className="table-cell">Activity Name</div>
                    <div className="table-cell">Location</div>
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                </div>
                <div className="table-body">
                    {activities.map(activity => (
                        <div className="table-row" key={activity.activityId}>
                            <div className="table-cell">{activity.title}</div>
                            <div className="table-cell">{activity.location}</div>
                            <div className="table-cell">{activity.startTime}</div>
                            <div className="table-cell">{activity.status}</div>
                            <div className="table-cell">
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditClick(activity)}
                                >
                                    Edit
                                </button>
                                <button className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showEditModal && editingActivity && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h3>Edit Activity</h3>
                        <form>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editingActivity.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={editingActivity.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={editingActivity.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={new Date(editingActivity.startTime).toISOString().slice(0, 16)}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Time</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={new Date(editingActivity.endTime).toISOString().slice(0, 16)}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Number</label>
                                <input
                                    type="number"
                                    name="number"
                                    value={editingActivity.number}
                                    onChange={handleInputChange}
                                    placeholder="Enter number"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL</label>
                                <input
                                    type="url"
                                    name="url"
                                    value={editingActivity.url}
                                    onChange={handleInputChange}
                                    placeholder="Enter URL"
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
                                                onClick={() => handleTagRemove(tag.tagId)}
                                                className="remove-tag"
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
                                        <h3>Please select your activity tags</h3>
                                        <div className="tags-container">
                                            {allTags.map(tag => (
                                                <div
                                                    key={tag.tagId}
                                                    className={`tag-item ${
                                                        selectedTags.some(t => t.tagId === tag.tagId) ? 'selected' : ''
                                                    }`}
                                                    onClick={() => handleTagSelect(tag)}
                                                >
                                                    {tag.name}
                                                </div>
                                            ))}
                                        </div>
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
                                    className="update-btn"
                                    onClick={handleUpdateActivity}
                                >
                                    Update Activity
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

export default ManageActivities;