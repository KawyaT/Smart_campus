import React, { useState } from 'react';
import '../styles/TicketForm.css';

const TicketForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      category: 'MAINTENANCE',
      priority: 'MEDIUM',
      severity: 'MINOR',
      location: '',
      estimatedHours: 0,
      department: '',
      facility: '',
      imageBase64: '',
      status: 'OPEN',
      assignedToId: '',
      assignedToName: '',
      resolutionNotes: '',
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
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      severity: formData.severity,
      location: formData.location,
      estimatedHours: Number(formData.estimatedHours || 0),
      department: formData.department || null,
      facility: formData.facility || null,
      imageBase64: formData.imageBase64 || null,
      status: formData.status,
      assignedToId: formData.assignedToId || null,
      assignedToName: formData.assignedToName || null,
      resolutionNotes: formData.resolutionNotes || null,
    };
    onSubmit(payload);
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

        <div className="form-group">
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          >
            <option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option>
            <option value="SEVERE">Severe</option>
            <option value="BLOCKING">Blocking</option>
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
          <label htmlFor="assignedToName">Assigned To</label>
          <input
            type="text"
            id="assignedToName"
            name="assignedToName"
            value={formData.assignedToName}
            onChange={handleChange}
            placeholder="Staff member name or ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimatedHours">Estimated Hours</label>
          <input
            type="number"
            id="estimatedHours"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., IT Services"
          />
        </div>

        <div className="form-group">
          <label htmlFor="facility">Facility</label>
          <input
            type="text"
            id="facility"
            name="facility"
            value={formData.facility}
            onChange={handleChange}
            placeholder="e.g., Main Library"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="resolutionNotes">Resolution Notes</label>
        <textarea
          id="resolutionNotes"
          name="resolutionNotes"
          value={formData.resolutionNotes}
          onChange={handleChange}
          rows="3"
          placeholder="How was the issue handled?"
        />
      </div>

      <button type="submit" disabled={isLoading} className="submit-btn" style={{marginTop: '20px'}}>
        {isLoading ? 'Saving...' : 'Submit Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;
