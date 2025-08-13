// ManageActivities.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageActivitiesCSS.css";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const [editingActivity, setEditingActivity] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);

    // Tag modal pagination
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;
    const totalPages = Math.ceil(allTags.length / tagsPerPage);

    // 搜索 & 视图切换 & 隐藏搜索区
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    // 新增：loading / err
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // 新增：正在取消的 activityId
    const [cancelingId, setCancelingId] = useState(null);

    useEffect(() => {
        fetchActivities();
        fetchAllTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (showTagModal) setCurrentPage(1);
    }, [showTagModal, allTags]);

    const fetchActivities = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getLoginOrganizerActivities");
            setActivities(res.data || []);
        } catch (error) {
            console.error("Failed to fetch activities:", error?.response || error);
            setErr("Failed to fetch activities.");
        } finally {
            setLoading(false);
            setLoaded(true);
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
        setEditingActivity({ ...activity });
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "startTime" || name === "endTime") {
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

    // 取消活动
    const handleCancelActivity = async (activity) => {
        const title = activity?.title || "";
        const id = activity?.activityId;
        if (!id) return;

        const ok = window.confirm(`are you sure to cancel activity : ${title}`);
        if (!ok) return;

        try {
            setCancelingId(id);
            await api.delete(`/cancleActivity?activityId=${id}`);
            alert("Cancelled successfully.");
            fetchActivities();
        } catch (error) {
            console.error("Failed to cancel activity:", error?.response || error);
            alert("Failed to cancel activity. Please try again.");
        } finally {
            setCancelingId(null);
        }
    };

    // 模糊搜索（title/location/status/date(yyyy/mm/dd)）
    const filteredActivities = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return activities;
        return activities.filter((a) => {
            const title = (a.title || "").toLowerCase();
            const location = (a.location || "").toLowerCase();
            const status = (a.status || "").toLowerCase();
            const dateStr = ((a.startTime || "").split(" ")[0] || "").toLowerCase();
            return (
                title.includes(q) ||
                location.includes(q) ||
                status.includes(q) ||
                dateStr.includes(q)
            );
        });
    }, [activities, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = activities.length;
        const now = new Date();

        let upcoming = 0;
        let past = 0;
        const statusMap = {};
        activities.forEach((a) => {
            const st = (a.status || "Unknown").trim();
            statusMap[st] = (statusMap[st] || 0) + 1;

            const raw = a.startTime || "";
            const dt = raw ? new Date(raw.replace(/\//g, "-")) : null;
            if (dt && !isNaN(dt.getTime())) {
                if (dt >= now) upcoming++;
                else past++;
            }
        });

        return { total, upcoming, past, statusMap };
    }, [activities]);

    // Tag modal pagination data
    const startIdx = (currentPage - 1) * tagsPerPage;
    const paginatedTags = allTags.slice(startIdx, startIdx + tagsPerPage);

    // 空状态
    if (!loading && !err && loaded && activities.length === 0) {
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

            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {!loading && activities.length > 0 && (
                <div className="activities-header">
                    <div className="view-options">
                        <button
                            className={`overview-btn ${showOverview ? "active" : ""}`}
                            onClick={() => setShowOverview(true)}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`list-btn ${!showOverview ? "active" : ""}`}
                            onClick={() => setShowOverview(false)}
                        >
                            📋 List
                        </button>
                    </div>

                    <div className="search-customize">
                        {showSearchBar && (
                            <input
                                type="text"
                                placeholder="Search by title / location / status / date..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        )}
                        <button
                            className="hide-btn"
                            onClick={() => setShowSearchBar((v) => !v)}
                            title={showSearchBar ? "Hide search bar" : "Show search bar"}
                        >
                            {showSearchBar ? "⨉Hide" : "Show"}
                        </button>
                    </div>
                </div>
            )}

            {/* —— 列表区：使用与 ManageChannel 一致的“flex 表格”表现 —— */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total</div>
                            <div className="overview-number">{overviewStats.total}</div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-title">Upcoming</div>
                            <div className="overview-number">{overviewStats.upcoming}</div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-title">Past</div>
                            <div className="overview-number">{overviewStats.past}</div>
                        </div>
                        <div className="overview-card wide">
                            <div className="overview-title">By Status</div>
                            <div className="status-list">
                                {Object.keys(overviewStats.statusMap).length === 0 ? (
                                    <span className="status-item">No status data</span>
                                ) : (
                                    Object.entries(overviewStats.statusMap).map(([k, v]) => (
                                        <span key={k} className="status-item">
                                            {k}: <b>{v}</b>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : filteredActivities.length > 0 ? (
                    <div className="activities-table">
                        <div className="table-header">
                            <div className="table-cell">Activity Name</div>
                            <div className="table-cell">Location</div>
                            <div className="table-cell">Date</div>
                            <div className="table-cell">Status</div>
                            <div className="table-cell">Actions</div>
                        </div>

                        <div className="table-body">
                            {filteredActivities.map((activity) => (
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
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancelActivity(activity)}
                                            disabled={cancelingId === activity.activityId}
                                            title="Cancel this activity"
                                        >
                                            {cancelingId === activity.activityId ? "Cancelling..." : "Cancel"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    activities.length > 0 && (
                        <p className="no-data">No matching activities</p>
                    )
                )
            )}

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
