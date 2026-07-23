import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Loader2, Star, CloudUpload } from 'lucide-react';
import toast from 'react-hot-toast';
import newsService from '../../services/newsService';
import { getImageUrl, extractError } from '../../utils/helpers';

const ImageUploader = ({ newsId, initialImages = [] }) => {
  const { t } = useTranslation();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]); // [{name, done}]
  const [deletingId, setDeletingId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const uploadFiles = useCallback(async (files) => {
    if (!files.length || !newsId) return;

    // Show preview progress list
    const progList = files.map((f) => ({ name: f.name, done: false }));
    setUploadProgress(progList);
    setUploading(true);

    try {
      const res = await newsService.uploadImages(newsId, files);
      const uploadedImgs = res.data.data || [];
      
      // If API returns all images, only take the last 'files.length' images (newly uploaded ones)
      const newImgs = uploadedImgs.length > images.length 
        ? uploadedImgs.slice(-files.length)
        : uploadedImgs;
      
      setImages((prev) => [...prev, ...newImgs]);
      toast.success(t('common.imagesUploaded', { count: files.length }));
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUploading(false);
      setUploadProgress([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [newsId, images.length, t]);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) uploadFiles(files);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length) uploadFiles(files);
  }, [uploadFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };

  const handleDelete = async (imgId) => {
    setDeletingId(imgId);
    try {
      await newsService.deleteImage(imgId);
      setImages((prev) => prev.filter((i) => i.id !== imgId));
      toast.success('Image deleted');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{t('news.images')}</label>
        {images.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
              style={{ aspectRatio: '16/9' }}
            >
              <img
                src={getImageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Primary badge */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-yellow-400/90 text-yellow-900 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                  <Star className="w-2.5 h-2.5 fill-yellow-900" />
                  Primary
                </div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform scale-75 group-hover:scale-100"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Uploading placeholders */}
          {uploading && uploadProgress.map((p, i) => (
            <div
              key={`progress-${i}`}
              className="relative rounded-xl overflow-hidden border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center gap-1.5 p-3"
              style={{ aspectRatio: '16/9' }}
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              <p className="text-[10px] text-primary-600 dark:text-primary-400 truncate w-full text-center">
                {p.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none
          ${dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
          ${images.length > 0 ? 'py-4' : 'py-8'}
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              Uploading...
            </p>
          </>
        ) : dragging ? (
          <>
            <CloudUpload className="w-8 h-8 text-primary-500 animate-bounce" />
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Drop images here
            </p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload images
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Click or drag here
              </p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              JPG, PNG, WEBP, GIF — max 5MB
            </span>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />
      </div>

      {/* Empty state hint */}
      {images.length === 0 && !uploading && (
        <p className="text-xs text-gray-400 text-center">
          First uploaded image will be the main image
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
