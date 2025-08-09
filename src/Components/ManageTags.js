import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentsCSS/ManageTagsCSS.css";

// ===== 后端地址（云端域名；本地联调改成 https://localhost:7085）=====
const API_BASE_URL = "https://adproject-webapp.azurewebsites.net";

// 统一 axios 实例：自动拼前缀 + 携带 Cookie（Session）
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const ManageTags = () => {
    const [tags, setTags] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagDescription, setNewTagDescription] = useState("");

    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTags = async () => {
        try {
            const res = await api.get("/api/Tag");
            setTags(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tags:", error?.response || error);
            alert("Failed to fetch tags.");
        }
    };

    const handleCreate = async () => {
        try {
            const data = {
                tagId: 0,
                name: newTagName,
                description: newTagDescription,
            };
            await api.post("/createTag", data);
            alert("Tag created successfully!");
            setShowCreateModal(false);
            setNewTagName("");
            setNewTagDescription("");
            fetchTags(); // 刷新列表
        } catch (error) {
            console.error("Failed to create tag:", error?.response || error);
            alert("Failed to create tag. Please try again.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "name") setNewTagName(value);
        if (name === "description") setNewTagDescription(value);
    };

    return (
        <div className="manage-tags-container">
            <div className="header-container">
                <h2>Manage Tags</h2>
                <button className="create-tag-btn" onClick={() => setShowCreateModal(true)}>
                    Create Tag
                </button>
            </div>

            <table className="tags-table">
                <thead>
                <tr>
                    <th>Tag ID</th>
                    <th>Name</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {tags.map((tag) => (
                    <tr key={tag.tagId}>
                        <td>{tag.tagId}</td>
                        <td>{tag.name}</td>
                        <td>{tag.description}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {showCreateModal && (
                <div className="create-modal-overlay">
                    <div className="create-modal">
                        <h3>Create Tag</h3>
                        <input
                            type="text"
                            name="name"
                            value={newTagName}
                            onChange={handleInputChange}
                            placeholder="Enter tag name"
                        />
                        <textarea
                            name="description"
                            value={newTagDescription}
                            onChange={handleInputChange}
                            placeholder="Enter tag description"
                        />
                        <button onClick={handleCreate}>Create</button>
                        <button onClick={() => setShowCreateModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTags;
