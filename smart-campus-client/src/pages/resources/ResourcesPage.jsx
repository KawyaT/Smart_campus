import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResourceCard from './ResourceCard';
import ResourceFilters from './ResourceFilters';
import ResourceFormModal from './ResourceFormModal';
import ResourceDetailModal from './ResourceDetailModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';
import {
  getAllResources,
  searchResources,
  createResource,
  updateResource,
  deleteResource,
} from '../../api/resourceApi';
import '../../components/DashboardShell.css';
import './ResourcesPage.css';

export default function ResourcesPage() {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const { isDark } = useTheme();
  const c = getColors(isDark);
  const isAdmin = role === 'ADMIN';
  const standaloneShell = pathname === '/resources';

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

  useEffect(() => {
    fetchResources(filters);
  }, [filters]);

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

  const handleView = (resource) => {
    setViewingResource(resource);
  };

  const handleCloseDetail = () => {
    setViewingResource(null);
  };

  const filtered = resources.filter((r) => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return r.name?.toLowerCase().includes(s) || r.location?.toLowerCase().includes(s);
  });

  const stats = [
    {
      label: 'Total resources',
      value: resources.length,
      iconBg: isDark ? '#0c2a1f' : '#d1fae5',
      iconColor: c.success,
      icon: 'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5',
    },
    {
      label: 'Active',
      value: resources.filter((r) => r.status === 'ACTIVE').length,
      iconBg: isDark ? '#0c1f3a' : '#dbeafe',
      iconColor: isDark ? '#60a5fa' : '#2563eb',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
    },
    {
      label: 'Labs',
      value: resources.filter((r) => r.type === 'LAB').length,
      iconBg: isDark ? '#2a1c0a' : '#fef3c7',
      iconColor: c.warning,
      icon:
        'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      label: 'Out of service',
      value: resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
      iconBg: isDark ? '#2d1515' : '#fee2e2',
      iconColor: c.danger,
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    },
  ];

  const rootClass = [
    'resources-page-root',
    'dash-main',
    standaloneShell ? 'resources-page-root--standalone' : '',
    isDark ? 'resources-page-root--dark' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <main className={rootClass}>
        <section className="resources-page-hero">
          <div className="resources-page-hero-head">
            <h1 className="resources-page-title">Facilities &amp; Assets</h1>
            <p className="resources-page-lead">Manage campus rooms, labs and equipment</p>
          </div>

          <div className="resources-page-stats">
            {stats.map((s, i) => (
              <div
                key={i}
                className="resources-page-stat-card"
                style={{
                  background: c.cardBg,
                  border: `1px solid ${c.border}`,
                  boxShadow: isDark ? '0 10px 22px rgba(0, 0, 0, 0.28)' : '0 10px 24px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="resources-page-stat-icon" style={{ background: s.iconBg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2">
                    <path d={s.icon} />
                  </svg>
                </div>
                <div className="resources-page-stat-value" style={{ color: c.textPrimary }}>
                  {s.value}
                </div>
                <div className="resources-page-stat-label" style={{ color: c.textMuted }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <ResourceFilters filters={filters} onChange={setFilters} />

        {loading ? (
          <p className="resources-page-hint" style={{ color: c.textMuted }}>
            Loading resources...
          </p>
        ) : filtered.length === 0 ? (
          <p className="resources-page-hint" style={{ color: c.textMuted }}>
            No resources found.
          </p>
        ) : (
          <div className="resources-page-grid">
            {filtered.map((r) => (
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
      </main>

      {showModal && (
        <ResourceFormModal
          resource={editingResource}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingResource(null);
          }}
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
    </>
  );
}
