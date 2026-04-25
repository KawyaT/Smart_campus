import React, { useState, useEffect } from 'react';
import ResourceCard from '../pages/resources/ResourceCard';
import ResourceFilters from '../pages/resources/ResourceFilters';
import ResourceFormModal from '../pages/resources/ResourceFormModal';
import ResourceDetailModal from '../pages/resources/ResourceDetailModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import {
  getAllResources, searchResources,
  createResource, updateResource, deleteResource
} from '../api/resourceApi';

export default function AdminFacilitiesPanel() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
//fetch resources with optional filters. If no filters are provided, fetch all resources. We set loading state to true while fetching and handle any errors that occur
  const fetchResources = async (f = {}) => {
    setLoading(true);
    try {
      const hasFilter = f.type || f.status || f.minCapacity;
      const res = hasFilter
        ? await searchResources({
            type: f.type || undefined,
            status: f.status || undefined,
            minCapacity: f.minCapacity || undefined,
          })
        : await getAllResources();
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
//fetch resources on component mount and whenever filters change
  useEffect(() => { fetchResources(filters); }, [filters]);
//handle save for both creating and updating resources. 
  const handleSave = async (data) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, data); //we're editing an existing resource
      } else {
        await createResource(data); // creating a new resource,
      }
      setShowModal(false);
      setEditingResource(null);
      fetchResources(filters);
    } catch (err) {
      alert('Error saving. Check console.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      fetchResources(filters);
    } catch (err) {
      alert('Error deleting.');
    }
  };
//when edit button is clicked on a resource card, we set the editingResource state to that resource and show the modal. The ResourceFormModal will populate its form fields based on the editingResource prop, allowing us to reuse the same modal for both creating and editing resources
  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowModal(true);
  };
//view resource details in a modal
  const handleView = (resource) => setViewingResource(resource);
  const handleCloseDetail = () => setViewingResource(null);

  const filtered = resources.filter(r => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return r.name?.toLowerCase().includes(s) || r.location?.toLowerCase().includes(s);
  });
//stat cards data. We calculate the values for each stat based on the current resources and define icons and colors for each stat card. The stats include total resources, active resources, labs, and out of service resources
  const stats = [
    { label: 'Total resources', value: resources.length,
      iconBg: isDark ? '#0c2a1f' : '#d1fae5', iconColor: c.success,
      icon: 'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5' },
    { label: 'Active', value: resources.filter(r => r.status === 'ACTIVE').length,
      iconBg: isDark ? '#0c1f3a' : '#dbeafe', iconColor: isDark ? '#60a5fa' : '#2563eb',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { label: 'Labs', value: resources.filter(r => r.type === 'LAB').length,
      iconBg: isDark ? '#2a1c0a' : '#fef3c7', iconColor: c.warning,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Out of service', value: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
      iconBg: isDark ? '#2d1515' : '#fee2e2', iconColor: c.danger,
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  ];

  return (
    <div className="admin-page admin-facilities-shell admin-shell-unified admin-main-tab-enter">
      <section className="admin-users-hero" aria-labelledby="facilities-hero-title">
        <div className="admin-users-hero-inner">
          <div className="admin-users-hero-copy">
            <span className="admin-users-hero-kicker">Resources</span>
            <h1 id="facilities-hero-title" className="admin-users-hero-title">
              Facilities
            </h1>
            <p className="admin-users-hero-lead">
              Manage campus rooms, labs, and equipment in the catalogue.
            </p>
          </div>
          <div className="admin-users-hero-accent" aria-hidden>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="56" height="56">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>
      </section>
         {/* admin toolbar with add resource button. This section is only visible to admins. When the "Add resource" button is clicked, we clear any editingResource state and show the ResourceFormModal for creating a new resource */}
      {isAdmin ? (
        <div className="admin-embed-toolbar admin-embed-toolbar--spread">
          <span className="admin-embed-toolbar-hint" aria-hidden />
          <button
            type="button"
            className="admin-embed-primary-btn"
            onClick={() => {
              setEditingResource(null);
              setShowModal(true);
            }}
          >
            + Add resource
          </button>
        </div>
      ) : null}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: isDark ? '0 10px 22px rgba(0, 0, 0, 0.28)' : '0 10px 24px rgba(15, 23, 42, 0.08)',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: s.iconBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '12px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2">
                <path d={s.icon} />
              </svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: c.textPrimary, marginBottom: '2px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: c.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <ResourceFilters filters={filters} onChange={setFilters} />

      {/* Grid */}
      {loading ? (
        <p style={{ color: c.textMuted, fontSize: '14px' }}>Loading resources...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: c.textMuted, fontSize: '14px' }}>No resources found.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ResourceFormModal
          resource={editingResource}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingResource(null); }}
        />
      )}

      {viewingResource && (
        <ResourceDetailModal
          resource={viewingResource}
          isAdmin={isAdmin}
          onClose={handleCloseDetail}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
