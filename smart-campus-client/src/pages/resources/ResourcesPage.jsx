import React, { useState, useEffect } from 'react';
import ResourceCard from './ResourceCard';
import ResourceFilters from './ResourceFilters';
import ResourceFormModal from './ResourceFormModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';
import {
  getAllResources, searchResources,
  createResource, updateResource, deleteResource
} from '../../api/resourceApi';

export default function ResourcesPage() {
  const { role, setRole } = useAuth();
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const isAdmin = role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.pageBg }}>

      <div style={{ flex: 1, padding: '28px 32px 48px', marginLeft: '220px', minWidth: '0', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: c.textPrimary, marginBottom: '4px' }}>
              Facilities &amp; Assets
            </h1>
            <p style={{ fontSize: '13px', color: c.textMuted }}>
              Manage campus rooms, labs and equipment
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Role switcher 
            <div style={{ display: 'flex', background: isDark ? '#1a2740' : '#e2e8f0', borderRadius: '8px', padding: '3px', gap: '2px' }}>
              {['USER', 'ADMIN'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: '5px 14px', borderRadius: '6px', fontSize: '12px',
                  cursor: 'pointer', border: 'none',
                  background: role === r ? c.accent : 'transparent',
                  color: role === r ? '#fff' : c.textSecondary,
                }}>
                  {r === 'USER' ? 'User' : 'Admin'}
                </button>
              ))}
            </div>
            {isAdmin && (
              <button onClick={() => { setEditingResource(null); setShowModal(true); }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: c.accent, color: '#fff', border: 'none',
                padding: '9px 18px', borderRadius: '9px',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add resource
              </button>
            )}*/}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: c.cardBg, border: `1px solid ${c.border}`,
              borderRadius: '12px', padding: '16px 18px',
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
              <ResourceCard key={r.id} resource={r} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ResourceFormModal
          resource={editingResource}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingResource(null); }}
        />
      )}
    </div>
  );
}