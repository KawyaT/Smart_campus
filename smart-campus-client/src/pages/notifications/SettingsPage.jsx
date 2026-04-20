import { useEffect, useMemo, useState } from "react";
import SettingsAPI from "../../api/settingsAPI";
import "../../styles/OperationsModules.css";

const defaultForm = {
  settingKey: "",
  settingValue: "",
  category: "general",
  description: "",
  updatedBy: "Operations Admin",
};

function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await SettingsAPI.getAll();
      setSettings(res.data || []);
    } catch (error) {
      console.error("Failed to load settings", error);
      alert("Failed to load settings");
    }
  };

  const visibleSettings = useMemo(() => {
    if (categoryFilter === "ALL") {
      return settings;
    }
    return settings.filter((item) => item.category === categoryFilter);
  }, [settings, categoryFilter]);

  const categories = useMemo(() => {
    const unique = new Set(settings.map((item) => item.category).filter(Boolean));
    return Array.from(unique);
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await SettingsAPI.upsert(form.settingKey, form);
      setForm(defaultForm);
      await loadSettings();
    } catch (error) {
      console.error("Failed to save setting", error);
      alert("Failed to save setting");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this setting?")) {
      return;
    }
    try {
      await SettingsAPI.remove(id);
      await loadSettings();
    } catch (error) {
      console.error("Failed to delete setting", error);
      alert("Failed to delete setting");
    }
  };

  return (
    <div className="operations-page">
      <div className="operations-header">
        <h1>⚙️ System Settings</h1>
      </div>

      <div className="operations-layout" style={{ display: 'block' }}>
        <section className="operations-panel">
          <h2>Create / Update Setting</h2>
          <form className="operations-form" onSubmit={handleSubmit}>
            <input
              placeholder="Setting key (ex: booking.maxHours)"
              value={form.settingKey}
              onChange={(e) => setForm({ ...form, settingKey: e.target.value })}
              required
            />
            <input
              placeholder="Setting value"
              value={form.settingValue}
              onChange={(e) => setForm({ ...form, settingValue: e.target.value })}
              required
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="Updated by"
              value={form.updatedBy}
              onChange={(e) => setForm({ ...form, updatedBy: e.target.value })}
            />
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Save Setting
              </button>
            </div>
          </form>
        </section>

        <section className="operations-panel">
          <div className="panel-topbar">
            <h2>Setting List</h2>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {visibleSettings.length === 0 ? (
            <p className="empty-state">No settings found</p>
          ) : (
            <div className="operations-table-wrap">
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Category</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSettings.map((setting) => (
                    <tr key={setting.id}>
                      <td>{setting.settingKey}</td>
                      <td>{setting.settingValue}</td>
                      <td>{setting.category}</td>
                      <td>{setting.updatedAt ? new Date(setting.updatedAt).toLocaleString() : "-"}</td>
                      <td>
                        <button
                          className="table-btn"
                          onClick={() =>
                            setForm({
                              settingKey: setting.settingKey,
                              settingValue: setting.settingValue,
                              category: setting.category || "general",
                              description: setting.description || "",
                              updatedBy: setting.updatedBy || "Operations Admin",
                            })
                          }
                        >
                          Edit
                        </button>
                        <button className="table-btn danger" onClick={() => handleDelete(setting.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
