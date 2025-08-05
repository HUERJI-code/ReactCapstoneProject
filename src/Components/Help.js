import React from 'react';
import '../ComponentsCSS/HelpCSS.css';

const Help = () => {
    return (
        <div className="help-container">
            <h2>Help</h2>
            <div className="help-content">
                <p>If you encounter any issues or have questions, please contact our administrator for assistance.</p>
                <div className="contact-info">
                    <h3>Administrator Contact:</h3>
                    <p>Email: admin@example.com</p>
                    <p>Phone: (123) 456-7890</p>
                </div>
            </div>
        </div>
    );
};

export default Help;