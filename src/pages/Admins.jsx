import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import useAuthStore from '../store/authStore';
import adminService from '../services/adminService';
import { extractError } from '../utils/helpers';

const Admins = () => {
  const { user } = useAuthStore();
  const isBoss = user?.role === 'BOSS';

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', surname: '', dbUrl: '', clientDomain: '' });
  const [dbUrlForm, setDbUrlForm] = useState({ dbUrl: '' });

  const limit = 20;

  const fetchAdmins = useCallback(async () => {
    if (!isBoss) return;
    setLoading(true);
    try {
      const { data } = await adminService.getAll({ page, limit });
      setAdmins(data.data.data);
      setTotal(data.data.total);
      setTotalPages(Math.ceil(data.data.total / limit) || 1);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [page, isBoss]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const openCreate = () => {
    setEditing(null);
    setForm({ email: '', password: '', name: '', surname: '', dbUrl: '', clientDomain: '' });
    setModalOpen(true);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    setForm({ email: '', password: '', name: admin.name, surname: admin.surname, dbUrl: '', clientDomain: admin.clientDomain || '' });
    setModalOpen(true);
  };

  const openDbUrl = (admin) => {
    setEditing(admin);
    setDbUrlForm({ dbUrl: '' });
    setDbModalOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) {
        await adminService.update(editing.id, { name: form.name, surname: form.surname, clientDomain: form.clientDomain });
        toast.success('Admin updated');
      } else {
        await adminService.create(form);
        toast.success('Admin created');
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDbUrlSubmit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminService.updateDbUrl(editing.id, dbUrlForm.dbUrl);
      toast.success('Database URL updated');
      setDbModalOpen(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Deactivate admin "${admin.name} ${admin.surname}"?`)) return;
    try {
      await adminService.remove(admin.id);
      toast.success('Admin deactivated');
      fetchAdmins();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  if (!isBoss) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Only BOSS users can manage admins.</p>
      </div>
    );
  }

  const columns = [
    { key: 'id', header: 'ID', width: 60 },
    { key: 'email', header: 'Email' },
    { key: 'name', header: 'Name' },
    { key: 'surname', header: 'Surname' },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      render: (val) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'error'}>{val}</Badge>
      ),
    },
    {
      key: 'clientDomain',
      header: 'Domain',
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: 120,
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      width: 120,
      render: (_val, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1 hover:text-primary-600" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => openDbUrl(row)} className="p-1 hover:text-blue-600" title="Update DB URL">
            <Database className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row)} className="p-1 hover:text-red-600" title="Deactivate">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Management</h1>
        <Button icon={Plus} onClick={openCreate}>Create Admin</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <>
          <Table columns={columns} data={admins} />
          <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Admin' : 'Create Admin'}>
        <div className="space-y-4">
          {!editing && (
            <>
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Input label="Database URL" value={form.dbUrl} onChange={(e) => setForm({ ...form, dbUrl: e.target.value })} placeholder="postgresql://..." />
            </>
          )}
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
          <Input label="Client Domain" value={form.clientDomain} onChange={(e) => setForm({ ...form, clientDomain: e.target.value })} placeholder="client1.com" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* DB URL Update Modal */}
      <Modal open={dbModalOpen} onClose={() => setDbModalOpen(false)} title="Update Database URL">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Updating the database URL will close the existing connection and create a new one on next request.
          </p>
          <Input label="New Database URL" value={dbUrlForm.dbUrl} onChange={(e) => setDbUrlForm({ dbUrl: e.target.value })} placeholder="postgresql://..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDbModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDbUrlSubmit} loading={saving}>Update URL</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admins;
