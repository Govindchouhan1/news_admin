import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Plus, Pencil, Trash2, ExternalLink, ShieldCheck, Server, RefreshCw, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import websiteService from '../services/websiteService';
import adminService from '../services/adminService';
import { extractError } from '../utils/helpers';
import useUiStore from '../store/uiStore';
import useAuthStore from '../store/authStore';

const schema = z.object({
  name: z.string().optional(),
  domain: z.string().min(3, 'Valid domain or URL required'),
});

const DEFAULT_SITES = [
  { id: 1, name: 'Main News Portal (Client Part 1)', domain: 'http://localhost:3000', status: 'ACTIVE', isPrimary: true },
  { id: 2, name: 'Modern Portal (Client Part 2)', domain: 'http://localhost:3001', status: 'ACTIVE', isPrimary: false },
  { id: 3, name: 'Amber Portal (Client Part 3)', domain: 'http://localhost:3002', status: 'ACTIVE', isPrimary: false },
  { id: 4, name: 'Emerald Portal (Client Part 4)', domain: 'http://localhost:3003', status: 'ACTIVE', isPrimary: false },
];

export const Websites = () => {
  const { openConfirm } = useUiStore();
  const { user } = useAuthStore();
  const isBoss = user?.role?.toUpperCase() === 'BOSS';

  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState(isBoss ? '' : (user?.adminId || ''));
  const [profile, setProfile] = useState(null);
  const [websites, setWebsites] = useState(DEFAULT_SITES);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  // Fetch admin list if BOSS
  useEffect(() => {
    if (!isBoss) return;
    adminService.getAll().then(({ data }) => {
      const list = data.data?.data || data.data || [];
      setAdmins(list);
    }).catch(() => {});
  }, [isBoss]);

  // Auto-select first admin once list loads
  useEffect(() => {
    if (!isBoss || selectedAdminId || !admins.length) return;
    setSelectedAdminId(admins[0].id);
  }, [isBoss, selectedAdminId, admins]);

  const fetchWebsites = useCallback(async () => {
    setLoading(true);
    try {
      if (isBoss && !selectedAdminId) {
        setWebsites([]);
        setProfile(null);
        setLoading(false);
        return;
      }
      const [webRes, profileRes] = await Promise.all([
        websiteService.getAll(selectedAdminId),
        websiteService.getProfile(selectedAdminId),
      ]);
      const data = webRes.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        setWebsites(data);
      } else {
        setWebsites([]);
      }
      setProfile(profileRes.data?.data || null);
    } catch (err) {
      if (!isBoss) {
        console.log('Using default portal layout sites:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedAdminId, isBoss]);

  useEffect(() => {
    if (!selectedAdminId && isBoss) {
      setWebsites([]);
      setProfile(null);
      return;
    }
    fetchWebsites();
  }, [fetchWebsites, selectedAdminId, isBoss]);

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', domain: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset({ name: item.name, domain: item.domain });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const name = data.name || data.domain.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
      if (editItem) {
        await websiteService.update(editItem.id, { name, domain: data.domain });
        toast.success('Website updated');
      } else {
        await websiteService.create({ name, domain: data.domain }, selectedAdminId);
        toast.success('Website created');
      }
      setModalOpen(false);
      fetchWebsites();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    openConfirm({
      title: 'Remove Website',
      message: `Are you sure you want to remove ${item.name}?`,
      onConfirm: async () => {
        try {
          await websiteService.remove(item.id);
          toast.success('Website removed');
          fetchWebsites();
        } catch (err) {
          toast.error(extractError(err));
        }
      },
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Website / Portal Name',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              {val}
              {row.isPrimary && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                  PRIMARY
                </span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'domain',
      header: 'Domain URL',
      render: (val) => (
        <a
          href={val?.startsWith('http') ? val : `https://${val}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-mono"
        >
          {val} <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      render: (val) => (
        <Badge variant={val === 'INACTIVE' ? 'danger' : 'success'}>
          {val === 'INACTIVE' ? 'INACTIVE' : 'LIVE'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 100,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Edit Website"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {!row.isPrimary && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Website"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-600" />
            <span>Websites Manager (वेबसाइट्स प्रबंधन)</span>
            <span className="text-xs font-normal text-gray-400">({websites.length} Sites)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            अपने पोर्टल के सभी डिजाइन वर्जन्स और क्लाइंट डोमेन का प्रबंधन करें।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchWebsites} loading={loading} size="sm">
            Refresh
          </Button>
          {(!isBoss || selectedAdminId) && (
            <Button icon={Plus} onClick={openCreate} size="sm">Add Website</Button>
          )}
        </div>
      </div>

      {/* Admin Selector (BOSS only) */}
      {isBoss && (
        <div className="card p-4">
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
        <div className="card p-4 flex items-center gap-3 border-l-4 border-l-primary-500">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {profile.name} {profile.surname}
            </p>
            <p className="text-xs text-gray-500">{profile.email}</p>
          </div>
        </div>
      )}

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between border-l-4 border-l-primary-600">
          <div>
            <p className="text-xs text-gray-500 font-medium">कुल रजिस्टर्ड वेबसाइट्स</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{websites.length}</p>
          </div>
          <Server className="w-8 h-8 text-primary-500/30" />
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <p className="text-xs text-gray-500 font-medium">सक्रिय लाइव पोर्टल्स</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {websites.filter((w) => w.status !== 'INACTIVE').length}
            </p>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500/30" />
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4 border-l-amber-600">
          <div>
            <p className="text-xs text-gray-500 font-medium">पोर्टल लेआउट वर्जन्स</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">4 Frontend Layouts</p>
          </div>
          <Globe className="w-8 h-8 text-amber-500/30" />
        </div>
      </div>

      {/* Table */}
      {isBoss && !selectedAdminId ? (
        <div className="card p-12 text-center">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select an admin to manage websites.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <Table columns={columns} data={websites} loading={loading} />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Website' : 'Add New Website'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>Save Website</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Domain / URL" placeholder="https://example.com" error={errors.domain && errors.domain.message} {...register('domain')} autoFocus />
        </form>
      </Modal>
    </div>
  );
};

export default Websites;
