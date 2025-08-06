import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ComponentsCSS/ManageTagsCSS.css';

const ManageTags = () => {
    const [tags, setTags] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagDescription, setNewTagDescription] = useState('');

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axios.get('https://localhost:7085/api/Tag');
            setTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleCreate = async () => {
        try {
            const data = {
                tagId: 0,
                name: newTagName,
                description: newTagDescription,
            };
            await axios.post('https://localhost:7085/createTag', data);
            alert('Tag created successfully!');
            setShowCreateModal(false);
            setNewTagName('');
            setNewTagDescription('');
            fetchTags(); // Refresh tags list after create
        } catch (error) {
            console.error("Failed to create tag:", error);
            alert('Failed to create tag. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            setNewTagName(value);
        } else if (name === 'description') {
            setNewTagDescription(value);
        }
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
                {tags.map(tag => (
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
                        ></textarea>
                        <button onClick={handleCreate}>Create</button>
                        <button onClick={() => setShowCreateModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTags;