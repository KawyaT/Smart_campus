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

  useEffect(() => { fetchResources(filters); }, [filters]);

  const handleSave = async (data) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, data);
      } else {
        await createResource(data);
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

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setShowModal(true);
  };

  const handleView = (resource) => setViewingResource(resource);
  const handleCloseDetail = () => setViewingResource(null);

  const filtered = resources.filter(r => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return r.name?.toLowerCase().includes(s) || r.location?.toLowerCase().includes(s);
  });

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

  const panelShellStyle = {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 8px 28px',
  };

  return (
    <div className="admin-page" style={panelShellStyle}>
      <header
        className="admin-page-head"
        style={{
          border: `1px solid ${c.border}`,
          borderRadius: '18px',
          padding: '24px 24px 20px',
          marginBottom: '20px',
          background: isDark
            ? 'linear-gradient(145deg, rgba(24, 37, 48, 0.95), rgba(17, 26, 34, 0.95))'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(241, 247, 250, 0.96))',
          boxShadow: isDark
            ? '0 12px 30px rgba(0, 0, 0, 0.35)'
            : '0 14px 34px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '2rem',
            letterSpacing: '-0.02em',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #155e75 0%, #1f8a70 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Facilities Management
        </h1>
        <p style={{ margin: '12px 0 0', color: '#607585', fontSize: '0.98rem', letterSpacing: '0.01em' }}>
          Manage campus rooms, labs and equipment
        </p>
      </header>

      {/* Top bar with Add Resource button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        <div>
          {/* Empty div for spacing */}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdmin && (
            <button onClick={() => { setEditingResource(null); setShowModal(true); }} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #1f8a70 0%, #155e75 100%)',
              color: '#fff',
              border: 'none',
              padding: '11px 20px',
              borderRadius: '11px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(31, 138, 112, 0.25)',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add resource
            </button>
          )}
        </div>
      </div>

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
