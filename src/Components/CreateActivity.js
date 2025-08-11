// CreateActivity.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/CreateActivityCSS.css";
import dayjs from "dayjs";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const CreateActivity = () => {
    const [activity, setActivity] = useState({
        title: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        number: "",
        url: "",
        tags: [], // 存储选中的标签ID
    });
    const [allTags, setAllTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;

    // Predict loading state
    const [predicting, setPredicting] = useState(false);

    // Compute total pages
    const totalPages = Math.ceil(allTags.length / tagsPerPage);

    useEffect(() => {
        fetchAllTags();
    }, []);

    // Reset to first page whenever modal opens or tag list updates
    useEffect(() => {
        if (showTagModal) {
            setCurrentPage(1);
        }
    }, [showTagModal, allTags]);

    const fetchAllTags = async () => {
        try {
            const res = await api.get("/api/Tag");
            setAllTags(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "startTime" || name === "endTime") {
            if (value) {
                const dateTimeStr = value + ":00.000Z";
                setActivity((prev) => ({ ...prev, [name]: dateTimeStr }));
            } else {
                setActivity((prev) => ({ ...prev, [name]: "" }));
            }
        } else {
            setActivity((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some((t) => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
            setActivity((prev) => ({
                ...prev,
                tags: [...prev.tags, tag.tagId],
            }));
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags(selectedTags.filter((t) => t.tagId !== tagId));
        setActivity((prev) => ({
            ...prev,
            tags: prev.tags.filter((id) => id !== tagId),
        }));
    };

    const formatTime = (timeStr) =>
        timeStr ? dayjs(timeStr).format("YYYY/MM/DD HH:mm") : "";

    const handleCreateActivity = async () => {
        try {
            const activityToSend = {
                ...activity,
                startTime: formatTime(activity.startTime),
                endTime: formatTime(activity.endTime),
                tagIds: activity.tags,
            };

            await api.post("/api/Activity/create", activityToSend);
            alert("Activity created successfully!");

            // Reset form
            setActivity({
                title: "",
                description: "",
                location: "",
                startTime: "",
                endTime: "",
                number: "",
                url: "",
                tags: [],
            });
            setSelectedTags([]);
        } catch (error) {
            console.error("Failed to create activity:", error);
            alert("Failed to create activity. Please try again.");
        }
    };

    // —— 根据 tagId 选中标签：若本地列表中不存在则先刷新列表再选中 ——
    const addTagById = async (id) => {
        // 如果 allTags 里没有，先刷新
        let tag = allTags.find((t) => t.tagId === id);
        if (!tag) {
            await fetchAllTags();
            tag = (allTags || []).find((t) => t.tagId === id);
        }
        if (!tag) return; // 仍然找不到就跳过

        // 已选中的就不重复添加
        if (selectedTags.some((t) => t.tagId === id)) return;

        setSelectedTags((prev) => [...prev, tag]);
        setActivity((prev) => ({
            ...prev,
            tags: prev.tags.includes(id) ? prev.tags : [...prev.tags, id],
        }));
    };

    // —— 点击 Predict Tag 按钮：调用 /api/ML/predict-tags ——
    const handlePredictTags = async () => {
        const { title, description } = activity;

        if (!title?.trim() || !description?.trim()) {
            alert("Please fill in Title and Description first.");
            return;
        }

        try {
            setPredicting(true);

            // 请求体示例：
            // {
            //   "title": "Urban Photography Exhibition",
            //   "description": "Showcase cityscape works by young photographers"
            // }
            const res = await api.post("/api/ML/predict-tags", {
                title: title.trim(),
                description: description.trim(),
            });

            // 兼容可能的返回格式：{ tagId: 3 } 或 { tagIds: [3,5] } 或 [3,5]
            const data = res.data || {};
            let ids = [];

            if (typeof data.tagId === "number") {
                ids = [data.tagId];
            } else if (Array.isArray(data.tagIds)) {
                ids = data.tagIds.filter((x) => typeof x === "number");
            } else if (Array.isArray(data)) {
                ids = data.filter((x) => typeof x === "number");
            }

            if (!ids.length) {
                alert("No tagId returned from prediction.");
                return;
            }

            // 重新拉取标签列表（以防预测出的 tag 不在本地列表中）
            await fetchAllTags();

            // 依次选中这些标签
            for (const id of ids) {
                // eslint-disable-next-line no-await-in-loop
                await addTagById(id);
            }

            alert("Predicted tag(s) added.");
        } catch (err) {
            console.error("Predict tags failed:", err?.response || err);
            alert("Failed to predict tags. Please try again.");
        } finally {
            setPredicting(false);
        }
    };

    // Determine which tags to show on the current page
    const indexStart = (currentPage - 1) * tagsPerPage;
    const indexEnd = indexStart + tagsPerPage;
    const paginatedTags = allTags.slice(indexStart, indexEnd);

    return (
        <div className="create-activity-container">
            <div className="create-activity-card">
                <h2>Create Activity</h2>
                <form>
                    {/* Title */}
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

                    {/* Description */}
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

                    {/* Location */}
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

                    {/* Start Time */}
                    <div className="form-group">
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : ""}
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
                            value={activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : ""}
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
                            value={activity.number}
                            onChange={handleInputChange}
                            placeholder="Enter number"
                            required
                        />
                    </div>

                    {/* URL */}
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

                    {/* Tags */}
                    <div className="tag-section">
                        <label>Tags</label>
                        <div className="tag-container">
                            {selectedTags.map((tag) => (
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

                    {/* Tag Selection Modal */}
                    {showTagModal && (
                        <div className="tag-modal-overlay">
                            <div className="tag-modal">
                                <h3>Please select your activity tags</h3>

                                <div className="tags-container">
                                    {paginatedTags.map((tag) => (
                                        <div
                                            key={tag.tagId}
                                            className={`tag-item ${
                                                selectedTags.some((t) => t.tagId === tag.tagId) ? "selected" : ""
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
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}

                                {/* 底部按钮区：先 Predict Tag，再 Back */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className={`predict-btn ${predicting ? "disabled" : ""}`}
                                        onClick={handlePredictTags}
                                        disabled={predicting}
                                        title="Predict tags from Title & Description"
                                    >
                                        {predicting ? "Predicting..." : "Predict Tag"}
                                    </button>

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
                        <button type="button" className="create-btn" onClick={handleCreateActivity}>
                            Create Activity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateActivity;
