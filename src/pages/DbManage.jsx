import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Globe, Database, User, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/Skeleton';
import websiteService from '../services/websiteService';
import adminService from '../services/adminService';
import { extractError } from '../utils/helpers';

const DbManage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isBoss = user.role === 'BOSS';

  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState(user.adminId || '');
  const [websites, setWebsites] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDomain, setSavingDomain] = useState(false);
  const [clientDomain, setClientDomain] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '' });

  // Fetch admin list if BOSS
  useEffect(() => {
    if (!isBoss) return;
    adminService.getAll().then(({ data }) => {
      setAdmins(data.data || []);
    }).catch(() => {});
  }, [isBoss]);

  // Auto-select first admin if none selected
  useEffect(() => {
    if (!isBoss || selectedAdminId || !admins.length) return;
    setSelectedAdminId(admins[0].id);
  }, [isBoss, selectedAdminId, admins]);

  const fetchData = useCallback(async () => {
    if (!selectedAdminId) return;
    setLoading(true);
    try {
      const [webRes, profileRes] = await Promise.all([
        websiteService.getAll(selectedAdminId),
        websiteService.getProfile(selectedAdminId),
      ]);
      setWebsites(webRes.data.data || []);
      const p = profileRes.data.data;
      setProfile(p);
      setClientDomain(p?.clientDomain || '');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedAdminId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveDomain = async () => {
    if (!clientDomain.trim()) {
      toast.error('Domain is required');
      return;
    }
    setSavingDomain(true);
    try {
      const { data } = await websiteService.updateDomain(clientDomain.trim(), selectedAdminId);
      setProfile(data.data);
      toast.success('Domain updated');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSavingDomain(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', domain: '' });
    setModalOpen(true);
  };

  const openEdit = (site) => {
    setEditing(site);
    setForm({ name: site.name, domain: site.domain || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Website name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await websiteService.update(editing.id, form);
        toast.success('Website updated');
      } else {
        await websiteService.create(form, selectedAdminId);
        toast.success('Website created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (site) => {
    if (!window.confirm(`Delete website "${site.name}"?`)) return;
    try {
      await websiteService.remove(site.id);
      toast.success('Website deleted');
      fetchData();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DB Manage</h1>
          <p className="text-sm text-gray-500 mt-1">Manage websites and database connections</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Website</Button>
      </div>

      {/* Admin Selector (BOSS only) */}
      {isBoss && (
        <div className="card p-4 mb-6">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
            Select Admin
          </label>
          <select
            className="input-field w-full"
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(Number(e.target.value))}
          >
            <option value="">-- Select Admin --</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.name} {a.surname} ({a.email})</option>
            ))}
          </select>
        </div>
      )}

      {/* Admin Profile Card */}
      {profile && (
        <div className="card p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {profile.name} {profile.surname}
              </h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Client Domain</label>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    value={clientDomain}
                    onChange={(e) => setClientDomain(e.target.value)}
                    placeholder="example.com"
                  />
                  <button
                    onClick={handleSaveDomain}
                    disabled={savingDomain}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap transition-colors"
                  >
                    {savingDomain ? '...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Websites List */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Websites ({websites.length})
        </h2>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : !selectedAdminId ? (
        <div className="card p-12 text-center">
          <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select an admin to manage websites.</p>
        </div>
      ) : websites.length === 0 ? (
        <div className="card p-12 text-center">
          <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No websites configured for this admin.</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Website" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {websites.map((site) => (
            <div key={site.id} className="card p-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{site.name}</h3>
                  <Badge variant={site.isActive ? 'success' : 'error'}>{site.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {site.domain && (
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> {site.domain}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">ID: {site.id} · Created: {new Date(site.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(site)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600 transition-colors" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(site)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Website' : 'Add Website'} size="sm">
        <div className="space-y-4">
          <Input
            label="Website Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="My News Site"
          />
          <Input
            label="Domain (optional)"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            placeholder="example.com"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DbManage;