// ManageChannel.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageChannelCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageChannel = () => {
    const [channels, setChannels] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [editingChannel, setEditingChannel] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);

    // —— Tag 悬浮框：分页 + 搜索/新增状态 —— //
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;
    const [tagSearchTerm, setTagSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);

    // 可选：Predict Tag（基于 channel 的 name/description）
    const [predicting, setPredicting] = useState(false);

    // 搜索/视图切换/显示隐藏搜索条（主列表）
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);

    // 正在取消中的 channelId（用于禁用按钮）
    const [cancelingId, setCancelingId] = useState(null);

    useEffect(() => {
        fetchChannels();
        fetchAllTags();
    }, []);

    // 打开 Tag 悬浮框时重置页码/搜索/新增表单状态
    useEffect(() => {
        if (showTagModal) {
            setCurrentPage(1);
            setTagSearchTerm("");
            setShowAddForm(false);
            setNewTagName("");
        }
    }, [showTagModal, allTags]);

    const fetchChannels = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/getOrganizerOwnedChannel");
            setChannels(res.data || []);
        } catch (error) {
            console.error("Failed to fetch channels:", error?.response || error);
            setErr("Failed to fetch channels.");
            setChannels([]);
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
            console.error("Failed to fetch tags:", error?.response || error);
        }
    };

    const handleEditClick = (channel) => {
        const tagIds = channel.tags ? channel.tags.map((t) => t.tagId) : [];
        setSelectedTags(tagIds.map((id) => allTags.find((t) => t.tagId === id)).filter(Boolean));
        setEditingChannel(channel);
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingChannel({ ...editingChannel, [name]: value });
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some((t) => t.tagId === tag.tagId)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags(selectedTags.filter((t) => t.tagId !== tagId));
    };

    const handleUpdateChannel = async () => {
        try {
            const { channelId, name, url, description } = editingChannel;
            const channelToUpdate = {
                id: channelId,
                name,
                url,
                description,
                tagIds: selectedTags.map((t) => t.tagId),
            };
            await api.post("/updateChannel", channelToUpdate);
            alert("Channel updated successfully!");
            setShowEditModal(false);
            fetchChannels();
        } catch (error) {
            console.error("Failed to update channel:", error?.response || error);
            alert("Failed to update channel. Please try again.");
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingChannel(null);
        setSelectedTags([]);
    };

    // === 取消频道 ===
    const handleCancelChannel = async (ch) => {
        const title = ch?.name || "";
        const id = ch?.channelId ?? ch?.id; // 兼容两种字段
        if (!id) return;

        const ok = window.confirm(`are you sure to cancel channel : ${title}`);
        if (!ok) return;

        try {
            setCancelingId(id);
            await api.delete(`/cancelChannel?channelId=${id}`);
            alert("Cancelled successfully.");
            fetchChannels();
        } catch (error) {
            console.error("Failed to cancel channel:", error?.response || error);
            alert("Failed to cancel channel. Please try again.");
        } finally {
            setCancelingId(null);
        }
    };

    // —— Tag 列表：搜索过滤 + 基于过滤的分页 —— //
    const filteredTags = useMemo(() => {
        const q = tagSearchTerm.trim().toLowerCase();
        if (!q) return allTags;
        return allTags.filter((t) => (t.name || "").toLowerCase().includes(q));
    }, [allTags, tagSearchTerm]);

    const totalPages = Math.ceil(filteredTags.length / tagsPerPage) || 1;
    const indexStart = (currentPage - 1) * tagsPerPage;
    const indexEnd = indexStart + tagsPerPage;
    const paginatedTags = filteredTags.slice(indexStart, indexEnd);

    // —— 根据 tagId 选中（用于新建/预测后） —— //
    const addTagById = async (id) => {
        let tag = allTags.find((t) => t.tagId === id);
        if (!tag) {
            await fetchAllTags();
            tag = (allTags || []).find((t) => t.tagId === id);
        }
        if (!tag) return;
        if (selectedTags.some((t) => t.tagId === id)) return;
        setSelectedTags((prev) => [...prev, tag]);
    };

    // —— 新建标签 —— //
    const handleCreateNewTag = async () => {
        const name = (newTagName || tagSearchTerm || "").trim();
        if (!name) {
            alert("Tag name cannot be empty.");
            return;
        }
        try {
            setCreatingTag(true);
            const res = await api.post("/createTag", {
                name,
                description: "1",
            });

            await fetchAllTags();

            let createdId = res?.data?.tagId;
            if (!createdId) {
                const found = (allTags || []).find(
                    (t) => (t.name || "").toLowerCase() === name.toLowerCase()
                );
                if (found) createdId = found.tagId;
            }

            if (createdId) {
                await addTagById(createdId);
                alert(`Tag "${name}" created and selected.`);
            } else {
                alert(`Tag "${name}" created. Please select it from the list.`);
            }

            setShowAddForm(false);
            setNewTagName("");
            setTagSearchTerm("");
            setCurrentPage(1);
        } catch (err) {
            console.error("Create tag failed:", err?.response || err);
            alert("Failed to create tag. Please try again.");
        } finally {
            setCreatingTag(false);
        }
    };

    // —— 可选：Predict Tag（如果你不需要，请删除此函数和按钮） —— //
    const handlePredictTags = async () => {
        const title = editingChannel?.name || "";
        const description = editingChannel?.description || "";
        if (!title.trim() || !description.trim()) {
            alert("Please fill in Name and Description first.");
            return;
        }
        try {
            setPredicting(true);
            const res = await api.post("/api/ML/predict-tags", {
                title: title.trim(),
                description: description.trim(),
            });

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

            await fetchAllTags();
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

    // 模糊搜索（主列表：name/url/description/status）
    const filteredChannels = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return channels;
        return channels.filter((ch) => {
            const name = (ch.name || "").toLowerCase();
            const url = (ch.url || "").toLowerCase();
            const desc = (ch.description || "").toLowerCase();
            const status = (ch.status || "").toLowerCase();
            return (
                name.includes(q) ||
                url.includes(q) ||
                desc.includes(q) ||
                status.includes(q)
            );
        });
    }, [channels, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = channels.length;
        const statusMap = {};
        channels.forEach((c) => {
            const st = (c.status || "Unknown").trim();
            statusMap[st] = (statusMap[st] || 0) + 1;
        });
        return { total, statusMap };
    }, [channels]);

    // 初始加载为空：仅标题 + 空提示（不显示工具条/列表）
    if (!loading && !err && loaded && channels.length === 0) {
        return (
            <div className="manage-channels-container">
                <h2>Manage Channels</h2>
                <p className="no-channel">no channel</p>
            </div>
        );
    }

    return (
        <div className="manage-channels-container">
            <h2>Manage Channels</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：只要初始非空（channels.length > 0） */}
            {!loading && channels.length > 0 && (
                <div className="channels-header">
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
                                placeholder="Search by name / url / description / status..."
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

            {/* 主体区域：Overview 或 列表 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total Channels</div>
                            <div className="overview-number">{overviewStats.total}</div>
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
                ) : filteredChannels.length > 0 ? (
                    <div className="channels-table">
                        <div className="table-header">
                            <div className="table-cell">Channel Name</div>
                            {/*<div className="table-cell">URL</div>*/}
                            <div className="table-cell">Description</div>
                            <div className="table-cell">Status</div>
                            <div className="table-cell">Actions</div>
                        </div>
                        <div className="table-body">
                            {filteredChannels.map((ch) => {
                                const id = ch?.channelId ?? ch?.id;
                                return (
                                    <div className="table-row" key={id}>
                                        <div className="table-cell">{ch.name}</div>
                                        {/*<div className="table-cell">{ch.url}</div>*/}
                                        <div className="table-cell">{ch.description}</div>
                                        <div className="table-cell">{ch.status}</div>
                                        <div className="table-cell">
                                            {ch.status?.toLowerCase() !== "cancelled" &&
                                                ch.status?.toLowerCase() !== "banned" && (
                                                    <>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => handleEditClick(ch)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="cancel-btn"
                                                            onClick={() => handleCancelChannel(ch)}
                                                            disabled={cancelingId === id}
                                                            title="Cancel this channel"
                                                        >
                                                            {cancelingId === id ? "Cancelling..." : "Cancel"}
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    channels.length > 0 && <p className="no-data">No matching channels</p>
                )
            )}

            {/* 编辑弹窗 */}
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

                            {/* Tag-selection modal（已加入：搜索、无结果创建、内联新建、基于搜索分页、可选 Predict） */}
                            {showTagModal && (
                                <div className="tag-modal-overlay">
                                    <div className="tag-modal">
                                        <h3>Please select your channel tags</h3>

                                        {/* 搜索框 */}
                                        <div className="tag-search-row">
                                            <input
                                                type="text"
                                                className="tag-search-input"
                                                placeholder="Search tag by name..."
                                                value={tagSearchTerm}
                                                onChange={(e) => {
                                                    setTagSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                    setShowAddForm(false);
                                                    setNewTagName("");
                                                }}
                                            />
                                        </div>

                                        {/* 无结果时的引导 */}
                                        {filteredTags.length === 0 && !showAddForm && (
                                            <div className="no-result-row">
                                                <span>No tags found.</span>
                                                <button
                                                    type="button"
                                                    className="add-new-tag-inline-btn"
                                                    onClick={() => {
                                                        setShowAddForm(true);
                                                        setNewTagName(tagSearchTerm.trim());
                                                    }}
                                                >
                                                    Add “{tagSearchTerm.trim() || "new"}”
                                                </button>
                                            </div>
                                        )}

                                        {/* 新建标签表单（内联） */}
                                        {showAddForm && (
                                            <div className="add-new-tag-form">
                                                <input
                                                    type="text"
                                                    className="add-new-tag-input"
                                                    placeholder="Enter new tag name"
                                                    value={newTagName}
                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                />
                                                <div className="add-new-tag-actions">
                                                    <button
                                                        type="button"
                                                        className={`create-new-tag-btn ${creatingTag ? "disabled" : ""}`}
                                                        onClick={handleCreateNewTag}
                                                        disabled={creatingTag}
                                                    >
                                                        {creatingTag ? "Creating..." : "Create & Select"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="cancel-new-tag-btn"
                                                        onClick={() => {
                                                            setShowAddForm(false);
                                                            setNewTagName("");
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* 标签列表（基于过滤分页） */}
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

                                        {filteredTags.length > 0 && totalPages > 1 && (
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

                                        <div className="modal-footer">
                                            {/* 如果不需要预测，删除下面这个按钮和 handlePredictTags 函数 */}
                                            <button
                                                type="button"
                                                className={`predict-btn ${predicting ? "disabled" : ""}`}
                                                onClick={handlePredictTags}
                                                disabled={predicting}
                                                title="Predict tags from Name & Description"
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

                            {/* Form actions */}
                            <div className="form-actions">
                                <button type="button" className="update-btn" onClick={handleUpdateChannel}>
                                    Update Channel
                                </button>
                                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
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
