import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import useHashtags from '../hooks/useHashtags';
import usePermission from '../hooks/usePermission';
import useUiStore from '../store/uiStore';
import hashtagService from '../services/hashtagService';
import { extractError } from '../utils/helpers';

const schema = z.object({
  name: z.string().min(1, 'validation.required').max(50),
});

const Hashtags = () => {
  const { t } = useTranslation();
  const { openConfirm } = useUiStore();
  const { canWrite } = usePermission();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { hashtags, pagination, loading, refetch } = useHashtags({
    page,
    limit: 20,
    search: search || undefined,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const openCreate = () => {
    reset({ name: '' });
    setModalOpen(true);
  };

  const onSubmit = async ({ name }) => {
    setSaving(true);
    try {
      await hashtagService.create({ name });
      toast.success(t('hashtags.createSuccess'));
      refetch();
      setModalOpen(false);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    openConfirm({
      title: t('common.delete'),
      message: t('hashtags.deleteConfirm'),
      onConfirm: async () => {
        try {
          await hashtagService.delete(item.id);
          toast.success(t('hashtags.deleteSuccess'));
          refetch();
        } catch (err) {
          toast.error(extractError(err));
        }
      },
    });
  };

  const columns = [
    {
      key: 'name',
      header: t('hashtags.name'),
      render: (val) => (
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{val}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: t('hashtags.slug'),
      render: (val) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
          {val}
        </code>
      ),
    },
    ...(canWrite ? [{
      key: 'actions',
      header: t('common.actions'),
      width: 80,
      render: (_, row) => (
        <button
          onClick={() => handleDelete(row)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('hashtags.title')}
          {pagination && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({pagination.total})
            </span>
          )}
        </h1>
        {canWrite && (
          <Button icon={Plus} onClick={openCreate}>
            {t('hashtags.createHashtag')}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('common.search') + '...'}
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={hashtags} loading={loading} />
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={20}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('hashtags.createHashtag')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <Input
          label={t('hashtags.name')}
          placeholder={t('hashtags.namePlaceholder')}
          error={errors.name && t(errors.name.message)}
          {...register('name')}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default Hashtags;
