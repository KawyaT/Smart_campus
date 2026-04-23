import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function digitsOnly(s) {
  return (s || '').replace(/\D/g, '').slice(0, 10);
}

/** Same rules as register / API: optional empty (clear); otherwise exactly 10 digits. */
function validatePhoneField(raw) {
  const compact = String(raw ?? '')
    .trim()
    .replace(/\s+/g, '');
  if (!compact) return null;
  if (!/^\d+$/.test(compact)) {
    return 'Phone must contain digits only (no minus or other characters)';
  }
  if (compact.length !== 10) {
    return 'Phone must be exactly 10 digits';
  }
  return null;
}

function ProfileSummaryCard({ user, role }) {
  return (
    <div className="user-profile-modal-summary">
      <span className="user-profile-modal-summary-avatar" aria-hidden>
        {initials(user?.name || user?.email || 'U')}
      </span>
      <div className="user-profile-modal-summary-text">
        <span className="user-profile-modal-summary-name">{user?.name || 'User'}</span>
        <span className="user-profile-modal-summary-email" title={user?.email || ''}>
          {user?.email || '—'}
        </span>
        <span className="user-profile-modal-summary-role">{role}</span>
      </div>
    </div>
  );
}

/**
 * Profile + account management (opened from user header menu).
 * @param {{ isOpen: boolean; onClose: () => void }} props
 */
const UserProfileModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAccount, syncUserFromServer } = useAuth();
  const [nameEdit, setNameEdit] = useState('');
  const [phoneEdit, setPhoneEdit] = useState('');
  const [addressEdit, setAddressEdit] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletePanelOpen, setDeletePanelOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const nameInputRef = useRef(null);
  const prevEditingName = useRef(false);

  const role = user?.role || 'USER';
  const nameDirty = nameEdit.trim() !== (user?.name || '').trim();
  const phoneNorm = digitsOnly(phoneEdit);
  const userPhoneNorm = digitsOnly(user?.phone || '');
  const phoneDirty = phoneNorm !== userPhoneNorm;
  const addressDirty = addressEdit.trim() !== (user?.address || '').trim();
  const profileDirty = nameDirty || phoneDirty || addressDirty;
  const deleteEmailMatches = deleteEmailInput.trim() === (user?.email || '');

  useEffect(() => {
    if (!isOpen) return undefined;
    void syncUserFromServer();
    setDeletePanelOpen(false);
    setDeleteEmailInput('');
    setEditingName(false);
    setPhoneError('');
    prevEditingName.current = false;
  }, [isOpen, syncUserFromServer]);

  useEffect(() => {
    if (!isOpen) return;
    const enteredEdit = editingName && !prevEditingName.current;
    prevEditingName.current = editingName;
    if (!enteredEdit) return;
    const seededPhone = digitsOnly(user?.phone || '');
    setNameEdit(user?.name || '');
    setPhoneEdit(seededPhone);
    setAddressEdit(user?.address || '');
    setPhoneError(validatePhoneField(seededPhone) || '');
  }, [isOpen, editingName, user?.name, user?.phone, user?.address, user?.id]);

  useEffect(() => {
    if (!isOpen || !editingName) return undefined;
    const t = window.setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [isOpen, editingName]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (editingName) {
        setEditingName(false);
        setNameEdit(user?.name || '');
        setPhoneEdit(digitsOnly(user?.phone || ''));
        setAddressEdit(user?.address || '');
        setPhoneError('');
        return;
      }
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, editingName, user?.name, user?.phone, user?.address]);

  if (!isOpen) return null;

  const handlePhoneChange = (ev) => {
    const value = ev.target.value;
    const next = digitsOnly(value);
    setPhoneEdit(next);
    const hadInvalidChars = value.length > 0 && /[^\d]/.test(value);
    if (hadInvalidChars) {
      setPhoneError('Phone must contain digits only (no minus or other characters)');
    } else {
      setPhoneError(validatePhoneField(next) || '');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileDirty || savingProfile) return;
    const phoneValidation = validatePhoneField(phoneEdit);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        name: nameEdit.trim(),
        phone: phoneNorm,
        address: addressEdit.trim(),
      });
      setEditingName(false);
      setPhoneError('');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteEmailMatches || deletingAccount) return;
    setDeletingAccount(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        onClose();
        navigate('/login', { replace: true });
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const phoneDisplay = user?.phone ? String(user.phone) : '—';
  const addressDisplay = user?.address?.trim() ? user.address : '—';

  return (
    <div className="user-profile-modal-root" role="presentation">
      <button
        type="button"
        className="user-profile-modal-backdrop"
        aria-label="Close profile"
        onClick={onClose}
      />
      <div
        className="user-profile-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-modal-title"
      >
        <div className="user-profile-modal-head">
          <h2 id="user-profile-modal-title">Your profile</h2>
          <div className="user-profile-modal-head-actions">
            <button
              type="button"
              className="user-profile-modal-icon-btn user-profile-modal-icon-btn--edit"
              aria-expanded={editingName}
              aria-label={editingName ? 'Done editing' : 'Edit profile'}
              title={editingName ? 'Done' : 'Edit profile'}
              onClick={() => {
                setEditingName((v) => !v);
                setNameEdit(user?.name || '');
                const p = digitsOnly(user?.phone || '');
                setPhoneEdit(p);
                setAddressEdit(user?.address || '');
                setPhoneError(validatePhoneField(p) || '');
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <button type="button" className="user-profile-modal-icon-btn user-profile-modal-icon-btn--close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <ProfileSummaryCard user={user} role={role} />

        {editingName ? (
          <form className="user-profile-form" onSubmit={handleSaveProfile}>
            <div className="user-form-field">
              <label htmlFor="modal-profile-name">Display name</label>
              <input
                ref={nameInputRef}
                id="modal-profile-name"
                type="text"
                className="user-form-input"
                value={nameEdit}
                onChange={(ev) => setNameEdit(ev.target.value)}
                autoComplete="name"
                maxLength={120}
                placeholder="Your name"
              />
            </div>
            <div className="user-form-field">
              <label htmlFor="modal-profile-phone">Contact number</label>
              <input
                id="modal-profile-phone"
                type="text"
                className={`user-form-input${phoneError ? ' user-form-input--invalid' : ''}`}
                inputMode="numeric"
                autoComplete="tel"
                value={phoneEdit}
                onChange={handlePhoneChange}
                placeholder="10 digits (optional)"
                maxLength={10}
                aria-invalid={phoneError ? 'true' : 'false'}
                aria-describedby={phoneError ? 'modal-profile-phone-error' : 'modal-profile-phone-hint'}
              />
              {phoneError ? (
                <p id="modal-profile-phone-error" className="user-form-error" role="alert">
                  {phoneError}
                </p>
              ) : (
                <p id="modal-profile-phone-hint" className="user-form-hint">
                  Exactly 10 digits, or leave blank to remove your number from your profile.
                </p>
              )}
            </div>
            <div className="user-form-field">
              <label htmlFor="modal-profile-address">Address</label>
              <textarea
                id="modal-profile-address"
                className="user-form-input user-form-textarea"
                value={addressEdit}
                onChange={(ev) => setAddressEdit(ev.target.value)}
                placeholder="Campus or mailing address (optional)"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="user-form-field user-form-field--readonly">
              <span className="user-form-label">Email</span>
              <span className="user-form-readonly">{user?.email || '—'}</span>
            </div>
            <div className="user-form-field user-form-field--readonly">
              <span className="user-form-label">Role</span>
              <span className="user-form-readonly">{role}</span>
            </div>
            <div className="user-form-actions">
              <button
                type="submit"
                className="user-btn-primary"
                disabled={!profileDirty || savingProfile || !!phoneError}
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="user-btn-ghost"
                onClick={() => {
                  setEditingName(false);
                  setNameEdit(user?.name || '');
                  setPhoneEdit(digitsOnly(user?.phone || ''));
                  setAddressEdit(user?.address || '');
                  setPhoneError('');
                }}
                disabled={savingProfile}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="user-profile-modal-contact">
            <div className="user-profile-modal-contact-row">
              <span className="user-profile-modal-contact-label">Name</span>
              <span className="user-profile-modal-contact-value">{user?.name || 'User'}</span>
            </div>
            <div className="user-profile-modal-contact-row">
              <span className="user-profile-modal-contact-label">Email</span>
              <span className="user-profile-modal-contact-value">{user?.email || '—'}</span>
            </div>
            <div className="user-profile-modal-contact-row">
              <span className="user-profile-modal-contact-label">Phone</span>
              <span className="user-profile-modal-contact-value">{phoneDisplay}</span>
            </div>
            <div className="user-profile-modal-contact-row">
              <span className="user-profile-modal-contact-label">Address</span>
              <span className="user-profile-modal-contact-value user-profile-modal-contact-value--multiline">
                {addressDisplay}
              </span>
            </div>
          </div>
        )}

        <div className="user-danger-zone">
          <h3 className="user-danger-title">Delete account</h3>
          <p className="user-danger-text">
            Permanently delete your SmartUNI account and profile data. This cannot be undone.
          </p>
          {!deletePanelOpen ? (
            <button
              type="button"
              className="user-btn-danger-outline"
              onClick={() => {
                setDeletePanelOpen(true);
                setDeleteEmailInput('');
              }}
            >
              Delete
            </button>
          ) : (
            <div className="user-delete-panel">
              <p className="user-delete-warning">
                Type your email address below to confirm. You will be signed out immediately.
              </p>
              <input
                type="email"
                className="user-form-input user-delete-email-input"
                value={deleteEmailInput}
                onChange={(ev) => setDeleteEmailInput(ev.target.value)}
                placeholder={user?.email || 'your@email.com'}
                autoComplete="off"
                aria-label="Confirm email to delete account"
              />
              <div className="user-delete-actions">
                <button
                  type="button"
                  className="user-btn-ghost"
                  onClick={() => {
                    setDeletePanelOpen(false);
                    setDeleteEmailInput('');
                  }}
                  disabled={deletingAccount}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="user-btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={!deleteEmailMatches || deletingAccount}
                >
                  {deletingAccount ? 'Deleting…' : 'Permanently delete account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
