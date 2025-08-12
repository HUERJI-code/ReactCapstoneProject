// CreateChannel.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/CreateChannelCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const CreateChannel = () => {
    const [channel, setChannel] = useState({
        name: "",
        url: "",
        description: "",
        tagIds: [],
    });

    const [allTags, setAllTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const tagsPerPage = 10;

    // NEW: 搜索 & 新建标签
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);

    useEffect(() => {
        fetchAllTags();
    }, []);

    // 打开弹窗或标签列表变化时，重置分页与搜索
    useEffect(() => {
        if (showTagModal) {
            setCurrentPage(1);
            setSearchTerm("");
            setShowAddForm(false);
            setNewTagName("");
        }
    }, [showTagModal, allTags]);

    const fetchAllTags = async () => {
        try {
            const res = await api.get("/api/Tag");
            setAllTags(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tags:", error?.response || error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setChannel((prev) => ({ ...prev, [name]: value }));
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.some((t) => t.tagId === tag.tagId)) {
            setSelectedTags((prev) => [...prev, tag]);
            setChannel((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.tagId] }));
        }
    };

    const handleTagRemove = (tagId) => {
        setSelectedTags((prev) => prev.filter((t) => t.tagId !== tagId));
        setChannel((prev) => ({
            ...prev,
            tagIds: prev.tagIds.filter((id) => id !== tagId),
        }));
    };

    const handleCreateChannel = async () => {
        try {
            await api.post("/api/Channel/create", channel);
            alert("Create Request Has Been Submitted");
            setChannel({ name: "", url: "", description: "", tagIds: [] });
            setSelectedTags([]);
        } catch (error) {
            console.error("Failed to create channel:", error?.response || error);
            alert("Failed to create channel. Please try again.");
        }
    };

    // ====== 搜索过滤 & 分页（基于过滤后的列表）======
    const filteredTags = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return allTags;
        return allTags.filter((t) => (t.name || "").toLowerCase().includes(q));
    }, [allTags, searchTerm]);

    const totalPages = Math.ceil(filteredTags.length / tagsPerPage) || 1;
    const startIdx = (currentPage - 1) * tagsPerPage;
    const paginatedTags = filteredTags.slice(startIdx, startIdx + tagsPerPage);

    // ====== 创建新标签（与 CreateActivity 对齐）======
    const addTagById = async (id) => {
        let tag = allTags.find((t) => t.tagId === id);
        if (!tag) {
            await fetchAllTags();
            tag = (allTags || []).find((t) => t.tagId === id);
        }
        if (!tag) return;
        if (selectedTags.some((t) => t.tagId === id)) return;

        setSelectedTags((prev) => [...prev, tag]);
        setChannel((prev) => ({
            ...prev,
            tagIds: prev.tagIds.includes(id) ? prev.tagIds : [...prev.tagIds, id],
        }));
    };

    const handleCreateNewTag = async () => {
        const name = (newTagName || searchTerm || "").trim();
        if (!name) {
            alert("Tag name cannot be empty.");
            return;
        }
        try {
            setCreatingTag(true);
            // 与 CreateActivity 保持一致：name + description="1"
            const res = await api.post("/createTag", {
                name,
                description: "1",
            });

            // 刷新列表
            await fetchAllTags();

            // 优先用返回的 tagId，否则在 allTags 里按名称兜底
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

            // 重置创建表单
            setShowAddForm(false);
            setNewTagName("");
            setSearchTerm("");
            setCurrentPage(1);
        } catch (err) {
            console.error("Create tag failed:", err?.response || err);
            alert("Failed to create tag. Please try again.");
        } finally {
            setCreatingTag(false);
        }
    };

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

                    {/* Tag Modal（升级：搜索 + 新建标签） */}
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
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                            setShowAddForm(false);
                                            setNewTagName("");
                                        }}
                                    />
                                </div>

                                {/* 无结果提示 + 快速创建入口 */}
                                {filteredTags.length === 0 && !showAddForm && (
                                    <div className="no-result-row">
                                        <span>No tags found.</span>
                                        <button
                                            type="button"
                                            className="add-new-tag-inline-btn"
                                            onClick={() => {
                                                setShowAddForm(true);
                                                setNewTagName(searchTerm.trim());
                                            }}
                                        >
                                            Add “{searchTerm.trim() || "new"}”
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
                                                className={`create-new-tag-btn ${
                                                    creatingTag ? "disabled" : ""
                                                }`}
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

                                {/* 标签列表（分页基于过滤后） */}
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
