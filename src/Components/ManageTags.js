// ManageTags.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageTagsCSS.css";

const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageTags = () => {
    const [tags, setTags] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagDescription, setNewTagDescription] = useState("");

    // 工具条/加载状态
    const [searchTerm, setSearchTerm] = useState("");
    const [showOverview, setShowOverview] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(true);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await api.get("/api/Tag");
            setTags(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tags:", error?.response || error);
            setErr("Failed to fetch tags.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    const handleCreate = async () => {
        try {
            const data = { tagId: 0, name: newTagName, description: newTagDescription };
            await api.post("/createTag", data);
            alert("Tag created successfully!");
            setShowCreateModal(false);
            setNewTagName("");
            setNewTagDescription("");
            fetchTags();
        } catch (error) {
            console.error("Failed to create tag:", error?.response || error);
            alert("Failed to create tag. Please try again.");
        }
    };

    // 模糊搜索
    const filteredTags = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return tags;
        return tags.filter((t) => {
            return (
                (t.name || "").toLowerCase().includes(q) ||
                (t.description || "").toLowerCase().includes(q) ||
                String(t.tagId).toLowerCase().includes(q)
            );
        });
    }, [tags, searchTerm]);

    // Overview 统计
    const overviewStats = useMemo(() => {
        const total = tags.length;
        return { total };
    }, [tags]);

    // ===== 空态（接口为空）—— 不显示任何按钮/表头/表格 =====
    if (!loading && !err && loaded && tags.length === 0) {
        return (
            <div className="manage-tags-container">
                <h2>Manage Tags</h2>
                <p className="no-data">No tags found</p>
            </div>
        );
    }

    return (
        <div className="manage-tags-container">
            <h2>Manage Tags</h2>

            {/* 顶部提示条 */}
            {loading && <div className="banner info">Loading...</div>}
            {err && <div className="banner error">{err}</div>}

            {/* 顶部工具条：非加载中且“首次加载非空”后始终显示（即 tags.length > 0） */}
            {!loading && tags.length > 0 && (
                <div className="tags-header">
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
                                placeholder="Search by ID / name / description..."
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
                    <button className="create-tag-btn" onClick={() => setShowCreateModal(true)}>
                        Create Tag
                    </button>
                </div>
            )}

            {/* 主区域 */}
            {!loading && !err && (
                showOverview ? (
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="overview-title">Total Tags</div>
                            <div className="overview-number">{overviewStats.total}</div>
                        </div>
                    </div>
                ) : filteredTags.length > 0 ? (
                    <table className="tags-table">
                        <colgroup>
                            <col className="col-id" />
                            <col className="col-name" />
                            <col className="col-description" />
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Tag ID</th>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTags.map((tag) => (
                            <tr key={tag.tagId} className="table-not">
                                <td>{tag.tagId}</td>
                                <td>{tag.name}</td>
                                <td>{tag.description}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    // 有数据但搜索后为空：不显示表头，仅提示；工具条仍显示（因上面条件改为 tags.length > 0）
                    tags.length > 0 && <p className="no-data">No matching tags</p>
                )
            )}

            {/* 创建标签弹窗 */}
            {showCreateModal && (
                <div className="create-modal-overlay">
                    <div className="create-modal">
                        <h3>Create Tag</h3>
                        <input
                            type="text"
                            name="name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Enter tag name"
                        />
                        <textarea
                            name="description"
                            value={newTagDescription}
                            onChange={(e) => setNewTagDescription(e.target.value)}
                            placeholder="Enter tag description"
                        />
                        <button className="create-btn" onClick={handleCreate}>Create</button>
                        <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTags;
