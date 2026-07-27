import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldCheck, ShieldOff, Loader2, Plus, Pencil, Trash2, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import useUiStore from '../store/uiStore';
import useAuthStore from '../store/authStore';
import userService from '../services/userService';
import { extractError } from '../utils/helpers';
import { formatDate } from '../utils/dateFormatter';

const BlockButton = ({ userId, isBlocked, onChanged }) => {
  const { t } = useTranslation();
  const { openConfirm } = useUiStore();
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    openConfirm({
      title: isBlocked ? t('users.unblock') : t('users.block'),
      message: isBlocked ? t('users.unblockConfirm') : t('users.blockConfirm'),
      onConfirm: async () => {
        setLoading(true);
        try {
          await userService.toggleBlock(userId, !isBlocked);
          onChanged(userId, { isBlocked: !isBlocked });
          toast.success(isBlocked ? 'User unblocked' : 'User blocked');
        } catch (err) {
          toast.error(extractError(err));
        } finally {
          setLoading(false);
        }
      },
      variant: isBlocked ? 'info' : 'danger',
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isBlocked ? t('users.unblock') : t('users.block')}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${isBlocked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40'
          : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/40'
        }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isBlocked ? (
        <ShieldOff className="w-3 h-3" />
      ) : (
        <ShieldCheck className="w-3 h-3" />
      )}
      {isBlocked ? t('users.blocked') : t('users.active')}
    </button>
  );
};

const Users = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isBoss = user?.role === 'BOSS';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pushingId, setPushingId] = useState(null);
  const [createForm, setCreateForm] = useState({
    username: '', email: '', password: '', name: '',
    dbUrl: '', clientDomain: '',
  });
  const [editForm, setEditForm] = useState({
    name: '', dbUrl: '', clientDomain: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({ limit: 100 });
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error(extractError(err));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const patchUser = (userId, fields) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...fields } : u))
    );
  };

  const openCreate = () => {
    setCreateForm({ username: '', email: '', password: '', name: '', dbUrl: '', clientDomain: '' });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await userService.create({ ...createForm, role: 'ADMIN' });
      toast.success('Admin created');
      setCreateOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ name: u.name, dbUrl: '', clientDomain: '' });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (editForm.name !== editingUser.name) payload.name = editForm.name;
      if (editingUser.role === 'ADMIN') {
        if (editForm.dbUrl) payload.dbUrl = editForm.dbUrl;
        if (editForm.clientDomain) payload.clientDomain = editForm.clientDomain;
      }
      if (Object.keys(payload).length === 0) {
        toast.error('No changes to save');
        setSaving(false);
        return;
      }
      await userService.update(editingUser.id, payload);
      toast.success('User updated');
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePushSchema = async (userId) => {
    setPushingId(userId);
    try {
      await userService.pushSchema(userId);
      toast.success('Schema pushed to tenant database');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setPushingId(null);
    }
  };

  const handleDelete = async (userToDelete) => {
    if (!window.confirm(`Delete user "${userToDelete.name}"?`)) return;
    try {
      await userService.remove(userToDelete.id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'username',
      header: t('users.username'),
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {val?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {row.name}
            </p>
            <p className="text-xs text-gray-400">@{val}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: t('users.email'),
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{val}</span>
      ),
    },
    {
      key: 'role',
      header: t('users.role'),
      width: 100,
      render: (val) => (
        <Badge variant={val === 'BOSS' ? 'purple' : val === 'ADMIN' ? 'info' : 'default'}>{val}</Badge>
      ),
    },
    {
      key: 'isBlocked',
      header: t('common.status'),
      width: 140,
      render: (val, row) =>
        isBoss ? (
          <BlockButton userId={row.id} isBlocked={val} onChanged={patchUser} />
        ) : (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            val
              ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              : 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
          }`}>
            {val ? t('users.blocked') : t('users.active')}
          </span>
        ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      width: 145,
      render: (val) => (
        <span className="text-xs text-gray-400">{formatDate(val)}</span>
      ),
    },
    ...(isBoss ? [{
      key: 'actions',
      header: '',
      width: 130,
      render: (_val, row) =>
        row.role !== 'BOSS' ? (
          <div className="flex gap-1">
            <button onClick={() => openEdit(row)} className="p-1 hover:text-primary-600" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            {row.role === 'ADMIN' && (
              <button
                onClick={() => handlePushSchema(row.id)}
                disabled={pushingId === row.id}
                className="p-1 hover:text-blue-600 disabled:opacity-50"
                title="Push schema to tenant DB"
              >
                {pushingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => handleDelete(row)} className="p-1 hover:text-red-600" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null,
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('users.title')}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filtered.length})
          </span>
        </h1>
        {isBoss && (
          <Button icon={Plus} onClick={openCreate}>Create Admin</Button>
        )}
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('users.username')}, ${t('users.email')}...`}
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={filtered} loading={loading} />
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Admin">
        <div className="space-y-4">
          <Input label="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
          <Input label="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
          <Input label="Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <Input label="Database URL" value={createForm.dbUrl} onChange={(e) => setCreateForm({ ...createForm, dbUrl: e.target.value })} placeholder="postgresql://..." />
          <Input label="Client Domain" value={createForm.clientDomain} onChange={(e) => setCreateForm({ ...createForm, clientDomain: e.target.value })} placeholder="client1.com" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit User - ${editingUser?.name || ''}`}>
        <div className="space-y-4">
          <Input label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          {editingUser?.role === 'ADMIN' && (
            <>
              <Input label="Database URL" value={editForm.dbUrl} onChange={(e) => setEditForm({ ...editForm, dbUrl: e.target.value })} placeholder="Leave blank to keep current" />
              <Input label="Client Domain" value={editForm.clientDomain} onChange={(e) => setEditForm({ ...editForm, clientDomain: e.target.value })} placeholder="Leave blank to keep current" />
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
