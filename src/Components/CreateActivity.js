import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/CreateActivityCSS.css';
import dayjs from "dayjs";

const CreateActivity = () => {
    const [activity, setActivity] = useState({
        title: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        number: '',
        url: '',
        tags: [] // 存储选中的标签ID
    });
    const [tags, setTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        fetchAllTags();
    }, []);

    const fetchAllTags = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Tag');
            setAllTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startTime' || name === 'endTime') {
            if (value) {
                const dateTimeStr = value + ':00.000Z';
                setActivity({
                    ...activity,
                    [name]: dateTimeStr
                });
            } else {
                setActivity({
                    ...activity,
                    [name]: ''
                });
            }
        } else {
            setActivity({
                ...activity,
                [name]: value
            });
        }
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some(t => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
            setActivity({
                ...activity,
                tags: [...activity.tags, tag.tagId]
            });
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags(selectedTags.filter(tag => tag.tagId !== tagId));
        setActivity({
            ...activity,
            tags: activity.tags.filter(tagIdItem => tagIdItem !== tagId)
        });
    };

    const handleCreateActivity = async () => {
        try {
            // 创建一个新的活动对象，将 tags 字段重命名为 tagIds
            const formatTime = (timeStr) => {
                return timeStr ? dayjs(timeStr).format('YYYY/MM/DD HH:mm') : '';
            };

            const activityToSend = {
                ...activity,
                startTime: formatTime(activity.startTime),
                endTime: formatTime(activity.endTime),
                tagIds: activity.tags // 将 tags 字段重命名为 tagIds
            };

            console.log(activityToSend);
            await axios.post('https://localhost:7085/api/Activity/create', activityToSend);
            alert('Activity created successfully!');
            setActivity({
                title: '',
                description: '',
                location: '',
                startTime: '',
                endTime: '',
                number: '',
                url: '',
                tags: []
            });
            setSelectedTags([]);
        } catch (error) {
            console.error("Failed to create activity:", error);
            alert('Failed to create activity. Please try again.');
        }
    };

    return (
        <div className="create-activity-container">
            <div className="create-activity-card">
                <h2>Create Activity</h2>
                <form>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={activity.title}
                            onChange={handleInputChange}
                            placeholder="Enter title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={activity.description}
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
                            value={activity.location}
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
                            value={activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : ''}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>End Time</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : ''}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Number</label>
                        <input
                            type="number"
                            name="number"
                            value={activity.number}
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
                            value={activity.url}
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
                            className="create-btn"
                            onClick={handleCreateActivity}
                        >
                            Create Activity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateActivity;