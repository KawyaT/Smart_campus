import React, { useState } from 'react';
import '../styles/TicketForm.css';

const TicketForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      category: 'MAINTENANCE',
      priority: 'MEDIUM',
      location: '',
      estimatedDays: 0,
      imageBase64: '',
      status: 'OPEN',
      assignedTo: '',
      resolution: '',
      notes: '',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageBase64: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter ticket title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="5"
          placeholder="Enter detailed description"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="MAINTENANCE">Maintenance</option>
            <option value="REPAIR">Repair</option>
            <option value="CLEANING">Cleaning</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Upload Image</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          style={{ padding: '10px 0' }}
        />
        {formData.imageBase64 && (
          <div style={{ marginTop: '10px' }}>
            <img 
              src={formData.imageBase64} 
              alt="Ticket Attachment" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} 
            />
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Building A, Room 101"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="assignedTo">Assigned To</label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            placeholder="Staff member name or ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimatedDays">Estimated Days</label>
          <input
            type="number"
            id="estimatedDays"
            name="estimatedDays"
            value={formData.estimatedDays}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="resolution">Resolution</label>
        <textarea
          id="resolution"
          name="resolution"
          value={formData.resolution}
          onChange={handleChange}
          rows="3"
          placeholder="How was the issue resolved?"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          placeholder="Additional notes"
        />
      </div>

      <button type="submit" disabled={isLoading} className="submit-btn" style={{marginTop: '20px'}}>
        {isLoading ? 'Saving...' : 'Submit Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;
