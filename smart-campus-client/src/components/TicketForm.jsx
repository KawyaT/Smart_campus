import React, { useMemo, useState } from 'react';
import '../styles/TicketForm.css';

const MIN_IMAGES_REQUIRED = 3;
const MAX_IMAGES_ALLOWED = 6;

const TicketForm = ({ initialData, onSubmit, isLoading, canManage = false }) => {
  const isEditMode = Boolean(initialData?.id);
  const initialGallery = Array.isArray(initialData?.imageGalleryBase64)
    ? initialData.imageGalleryBase64.filter(Boolean)
    : initialData?.imageBase64
      ? [initialData.imageBase64]
      : [];

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
      imageGalleryBase64: [],
    }
  );
  const [galleryImages, setGalleryImages] = useState(initialGallery);
  const [formErrors, setFormErrors] = useState({});

  const imageCountText = useMemo(
    () => `${galleryImages.length}/${MAX_IMAGES_ALLOWED} images selected`,
    [galleryImages.length]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nonImages = files.some((file) => !file.type.startsWith('image/'));
    if (nonImages) {
      setFormErrors((prev) => ({
        ...prev,
        images: 'Only image files are allowed.',
      }));
      return;
    }

    try {
      const encoded = await Promise.all(files.map((file) => toBase64(file)));
      setGalleryImages((prev) => {
        const merged = [...prev, ...encoded].slice(0, MAX_IMAGES_ALLOWED);
        setFormData((current) => ({
          ...current,
          imageBase64: merged[0] || '',
          imageGalleryBase64: merged,
        }));
        return merged;
      });
      setFormErrors((prev) => ({ ...prev, images: '' }));
    } catch {
      setFormErrors((prev) => ({
        ...prev,
        images: 'Failed to process selected images. Please try again.',
      }));
    }

    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setGalleryImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      setFormData((current) => ({
        ...current,
        imageBase64: next[0] || '',
        imageGalleryBase64: next,
      }));
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required.';
    if ((formData.title || '').trim().length > 120) errors.title = 'Title must be 120 characters or less.';
    if (!formData.description?.trim()) errors.description = 'Description is required.';
    if ((formData.description || '').trim().length < 15) errors.description = 'Description must be at least 15 characters.';
    if (!formData.location?.trim()) errors.location = 'Location is required.';
    if (Number(formData.estimatedHours || 0) < 0) errors.estimatedHours = 'Estimated hours cannot be negative.';
    if (!isEditMode && galleryImages.length < MIN_IMAGES_REQUIRED) {
      errors.images = `Please upload at least ${MIN_IMAGES_REQUIRED} images for a new incident report.`;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      severity: formData.severity,
      location: formData.location.trim(),
      estimatedHours: Number(formData.estimatedHours || 0),
      department: formData.department?.trim() || null,
      facility: formData.facility?.trim() || null,
      imageBase64: galleryImages[0] || null,
      imageGalleryBase64: galleryImages,
      status: formData.status,
      assignedToId: formData.assignedToId?.trim() || null,
      assignedToName: formData.assignedToName?.trim() || null,
      resolutionNotes: formData.resolutionNotes?.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <h3 className="form-section-title">Incident details</h3>

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
        {formErrors.title ? <small className="form-error">{formErrors.title}</small> : null}
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
        {formErrors.description ? <small className="form-error">{formErrors.description}</small> : null}
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
        <label htmlFor="ticket-images">Incident images *</label>
        <input
          id="ticket-images"
          className="image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <small className="field-help">
          Upload at least {MIN_IMAGES_REQUIRED} images for new tickets. Maximum {MAX_IMAGES_ALLOWED} images.
        </small>
        <small className="field-help">{imageCountText}</small>
        {formErrors.images ? <small className="form-error">{formErrors.images}</small> : null}

        {galleryImages.length > 0 ? (
          <div className="image-preview-grid">
            {galleryImages.map((image, index) => (
              <div className="image-preview-item" key={`ticket-preview-${index}`}>
                <img src={image} alt={`Ticket attachment ${index + 1}`} className="image-preview" />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <h3 className="form-section-title">Tracking details</h3>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={!canManage}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          {!canManage ? <small className="field-help">Only admin or technician can change status.</small> : null}
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
            required
          />
          {formErrors.location ? <small className="form-error">{formErrors.location}</small> : null}
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
          {formErrors.estimatedHours ? <small className="form-error">{formErrors.estimatedHours}</small> : null}
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

      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Saving...' : isEditMode ? 'Update ticket' : 'Submit ticket'}
      </button>
    </form>
  );
};

export default TicketForm;
