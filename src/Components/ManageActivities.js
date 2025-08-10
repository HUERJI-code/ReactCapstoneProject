// ManageActivities.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageActivitiesCSS.css";

// ===== 后端地址（云端域名，按需改成本地 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loaded, setLoaded] = useState(false); // ← 新增：是否已加载完成

    const [editingActivity, setEditingActivity] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);

    // Pagination state for tag modal
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;
    const totalPages = Math.ceil(allTags.length / tagsPerPage);

    useEffect(() => {
        fetchActivities();
        fetchAllTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset to first page when opening the tag modal or when tags change
    useEffect(() => {
        if (showTagModal) setCurrentPage(1);
    }, [showTagModal, allTags]);

    const fetchActivities = async () => {
        try {
            const res = await api.get("/getLoginOrganizerActivities");
            setActivities(res.data || []);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoaded(true); // ← 标记加载结束
        }
    };

    const fetchAllTags = async () => {
        try {
            const res = await api.get("/api/Tag");
            setAllTags(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleEditClick = (activity) => {
        const tagIds = activity.tags ? activity.tags.map((t) => t.tagId) : [];
        setSelectedTags(
            tagIds.map((id) => allTags.find((t) => t.tagId === id)).filter(Boolean)
        );
        setEditingActivity({ ...activity }); // clone
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "startTime" || name === "endTime") {
            // from "YYYY-MM-DDTHH:mm" to "YYYY/MM/DD HH:mm"
            const formatted = value ? value.replace("T", " ").replace(/-/g, "/") : "";
            setEditingActivity((prev) => ({ ...prev, [name]: formatted }));
        } else {
            setEditingActivity((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some((t) => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags(selectedTags.filter((t) => t.tagId !== tagId));
    };

    const handleUpdateActivity = async () => {
        try {
            const activityToUpdate = {
                ...editingActivity,
                tagIds: selectedTags.map((t) => t.tagId),
            };
            await api.put(
                `/api/Activity/update/${editingActivity.activityId}`,
                activityToUpdate
            );
            alert("Activity updated successfully!");
            setShowEditModal(false);
            fetchActivities();
        } catch (error) {
            console.error("Failed to update activity:", error);
            alert("Failed to update activity. Please try again.");
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingActivity(null);
        setSelectedTags([]);
    };

    // Paginated tags for modal
    const startIdx = (currentPage - 1) * tagsPerPage;
    const paginatedTags = allTags.slice(startIdx, startIdx + tagsPerPage);

    // ====== 空状态：只显示主标题 + “no activity” ======
    if (loaded && activities.length === 0) {
        return (
            <div className="manage-activities-container">
                <h2>My Activities</h2>
                <p className="no-activity">no activity</p>
            </div>
        );
    }


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
                    {activities.map((activity) => (
                        <div className="table-row" key={activity.activityId}>
                            <div className="table-cell">{activity.title}</div>
                            <div className="table-cell">{activity.location}</div>
                            <div className="table-cell">
                                {(activity.startTime || "").split(" ")[0]}
                            </div>
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
                            {/* Title */}
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editingActivity.title || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={editingActivity.description || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={editingActivity.location || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Start Time */}
                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={(() => {
                                        const val = editingActivity.startTime || "";
                                        const [date, time] = val.split(" ");
                                        return date && time
                                            ? `${date.replace(/\//g, "-")}T${time}`
                                            : "";
                                    })()}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* End Time */}
                            <div className="form-group">
                                <label>End Time</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={(() => {
                                        const val = editingActivity.endTime || "";
                                        const [date, time] = val.split(" ");
                                        return date && time
                                            ? `${date.replace(/\//g, "-")}T${time}`
                                            : "";
                                    })()}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Number */}
                            <div className="form-group">
                                <label>Number</label>
                                <input
                                    type="number"
                                    name="number"
                                    value={editingActivity.number ?? ""}
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
                                    value={editingActivity.url || ""}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Tags */}
                            <div className="tag-section">
                                <label>Tags</label>
                                <div className="tag-container">
                                    {selectedTags.map((tag) => (
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

                            {/* Tag-Selection Modal */}
                            {showTagModal && (
                                <div className="tag-modal-overlay">
                                    <div className="tag-modal">
                                        <h3>Please select your activity tags</h3>
                                        <div className="tags-container">
                                            {paginatedTags.map((tag) => (
                                                <div
                                                    key={tag.tagId}
                                                    className={`tag-item ${
                                                        selectedTags.some((t) => t.tagId === tag.tagId)
                                                            ? "selected"
                                                            : ""
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
                                                    onClick={() =>
                                                        setCurrentPage((p) => Math.max(1, p - 1))
                                                    }
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
                                                    onClick={() =>
                                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                                    }
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

                            {/* Form Actions */}
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
