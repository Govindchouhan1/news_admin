import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import TipTapEditor from '../editor/TipTapEditor';
import ImageUploader from './ImageUploader';
import HashtagInput from './HashtagInput';

const schema = z.object({
  title: z.string().min(3, 'validation.minLength').max(255, 'validation.maxLength'),
  shortDescription: z.string().min(10, 'validation.minLength').max(500, 'validation.maxLength'),
  content: z.string().min(10, 'validation.minLength'),
  categoryId: z.string().min(1, 'validation.required'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  rank: z.coerce.number().int().min(0).max(10),
  slug: z.string().optional(),
  customUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

const NewsForm = ({ defaultValues, categories, onSubmit: onSubmitProp, loading, newsId, assignedCategoryIds }) => {
  const { t } = useTranslation();

  const [hashtags, setHashtags] = useState(
    defaultValues?.hashtags?.map((h) => h.name) || []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      shortDescription: defaultValues?.shortDescription || '',
      content: defaultValues?.content || '',
      categoryId: String(defaultValues?.category?.id || defaultValues?.categoryId || ''),
      status: defaultValues?.status || 'DRAFT',
      rank: defaultValues?.rank ?? 0,
      slug: defaultValues?.slug || '',
      customUrl: defaultValues?.customUrl || '',
      metaTitle: defaultValues?.metaTitle || '',
      metaDescription: defaultValues?.metaDescription || '',
      metaKeywords: defaultValues?.metaKeywords || '',
    },
  });

  const onSubmit = (data) => {
    onSubmitProp({ ...data, hashtags });
  };

  const filteredCategories = assignedCategoryIds
    ? categories.filter((c) => assignedCategoryIds.includes(c.id))
    : categories;
  const categoryOptions = filteredCategories.map((c) => ({ value: String(c.id), label: c.name }));

  const statusOptions = [
    { value: 'DRAFT', label: t('news.draft') },
    { value: 'PUBLISHED', label: t('news.published') },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Top action bar ── */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-400">
          {newsId ? t('news.editNews') : t('news.createNews')}
        </p>
        <Button type="submit" loading={isSubmitting || loading} size="sm">
          {t('common.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields — left 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <Input
            label={t('news.newsTitle')}
            placeholder={t('news.titlePlaceholder')}
            error={errors.title && t(errors.title.message, { min: 3, max: 255 })}
            {...register('title')}
          />

          {/* Short Description */}
          <Textarea
            label={t('news.shortDescription')}
            placeholder={t('news.shortDescPlaceholder')}
            rows={3}
            error={errors.shortDescription && t(errors.shortDescription.message, { min: 10, max: 500 })}
            {...register('shortDescription')}
          />

          {/* Content — TipTap */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TipTapEditor
                label={t('news.content')}
                value={field.value}
                onChange={field.onChange}
                placeholder={t('news.contentPlaceholder')}
                error={errors.content && t(errors.content.message, { min: 10 })}
              />
            )}
          />

          {/* ── SEO & Custom URL Settings Section ── */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600"></span>
              Dynamic URL & SEO Optimization (Search Engine & GEO Settings)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Custom News URL Slug (Permalink)"
                placeholder="e.g. customized-news-headline-url"
                {...register('slug')}
              />

              <Input
                label="Dynamic External Source / Custom URL Link"
                placeholder="https://example.com/custom-news-link"
                {...register('customUrl')}
              />
            </div>

            <Input
              label="SEO Meta Title"
              placeholder="Catchy search engine title (defaults to News Title)"
              {...register('metaTitle')}
            />

            <Textarea
              label="SEO Meta Description"
              placeholder="High CTR search summary description"
              rows={2}
              {...register('metaDescription')}
            />

            <Input
              label="SEO Meta Keywords"
              placeholder="e.g. breaking news, india, politics, election 2026"
              {...register('metaKeywords')}
            />
          </div>
        </div>

        {/* Sidebar — right 1 col */}
        <div className="space-y-5">
          {/* Status */}
          <Select
            label={t('news.status')}
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          {/* Category */}
          <Select
            label={t('news.category')}
            placeholder={t('news.selectCategory')}
            options={categoryOptions}
            error={errors.categoryId && t(errors.categoryId.message)}
            {...register('categoryId')}
          />

          {/* Rank */}
          <div>
            <label className="label">{t('news.rank')} (0–10)</label>
            <input
              type="number"
              className={`input-field ${errors.rank ? 'error' : ''}`}
              {...register('rank', {
                valueAsNumber: true,
                min: 0,
                max: 10,
                onChange: (e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) {
                    if (v < 0) e.target.value = 0;
                    if (v > 10) e.target.value = 10;
                  }
                },
              })}
              min={0}
              max={10}
            />
            {errors.rank && (
              <p className="mt-1 text-xs text-red-500">{t('validation.required')}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">{t('news.rankTooltip')}</p>
          </div>

          {/* Hashtags */}
          <HashtagInput
            value={hashtags}
            onChange={setHashtags}
            max={10}
          />

          {/* Images */}
          {newsId && (
            <ImageUploader
              newsId={newsId}
              initialImages={defaultValues?.images || []}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        <Button type="submit" loading={isSubmitting || loading}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default NewsForm;
