import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import useCategories from '../hooks/useCategories';
import usePermission from '../hooks/usePermission';
import useUiStore from '../store/uiStore';
import categoryService from '../services/categoryService';
import { extractError } from '../utils/helpers';

const schema = z.object({
  name: z.string().min(1, 'validation.required').max(100),
});

const Categories = () => {
  const { t } = useTranslation();
  const { categories, loading, refetch } = useCategories();
  const { openConfirm } = useUiStore();
  const { canWrite } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset({ name: item.name });
    setModalOpen(true);
  };

  const onSubmit = async ({ name }) => {
    setSaving(true);
    try {
      if (editItem) {
        await categoryService.update(editItem.id, { name });
        toast.success(t('categories.updateSuccess'));
      } else {
        await categoryService.create({ name });
        toast.success(t('categories.createSuccess'));
      }
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
      message: t('categories.deleteConfirm'),
      onConfirm: async () => {
        try {
          await categoryService.delete(item.id);
          toast.success(t('categories.deleteSuccess'));
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
      header: t('categories.name'),
      render: (val) => (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{val}</span>
      ),
    },
    {
      key: 'slug',
      header: t('categories.slug'),
      render: (val) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
          {val}
        </code>
      ),
    },
    {
      key: 'isDeleted',
      header: t('common.status'),
      width: 100,
      render: (val) => (
        <Badge variant={val ? 'danger' : 'success'}>
          {val ? t('common.inactive') : t('common.active')}
        </Badge>
      ),
    },
    ...(canWrite ? [{
      key: 'actions',
      header: t('common.actions'),
      width: 90,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('categories.title')}
          <span className="ml-2 text-sm font-normal text-gray-400">({categories.length})</span>
        </h1>
        {canWrite && (
          <Button icon={Plus} onClick={openCreate}>
            {t('categories.createCategory')}
          </Button>
        )}
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={categories} loading={loading} />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? t('categories.editCategory') : t('categories.createCategory')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={saving}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <Input
          label={t('categories.name')}
          placeholder={t('categories.namePlaceholder')}
          error={errors.name && t(errors.name.message)}
          {...register('name')}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default Categories;
