import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutGrid, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PLACEMENTS = [
  { id: 'TOP_LEADERBOARD', label: 'Top Leaderboard Header Banner (728x90)' },
  { id: 'SIDEBAR_RECTANGLE', label: 'Sidebar Medium Rectangle (300x250)' },
  { id: 'SIDEBAR_SKYSCRAPER', label: 'Sidebar Half Page Skyscraper (300x600)' },
  { id: 'MID_PAGE_LEADERBOARD', label: 'Mid-Page Responsive Leaderboard (728x90)' },
];

const AdsManager = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    placement: 'SIDEBAR_RECTANGLE',
    type: 'IMAGE',
    imageUrl: '',
    targetUrl: '',
    adsenseClient: '',
    adsenseSlot: '',
    isActive: true,
  });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ads/all');
      const data = res.data?.data || res.data || [];
      setAds(data);
    } catch (err) {
      toast.error('Failed to load advertisement units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      placement: 'SIDEBAR_RECTANGLE',
      type: 'IMAGE',
      imageUrl: '',
      targetUrl: '',
      adsenseClient: '',
      adsenseSlot: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      placement: ad.placement || 'SIDEBAR_RECTANGLE',
      type: ad.type || 'IMAGE',
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl || '',
      adsenseClient: ad.adsenseClient || '',
      adsenseSlot: ad.adsenseSlot || '',
      isActive: ad.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await api.put(`/ads/${editingAd.id}`, formData);
        toast.success('Ad updated successfully');
      } else {
        await api.post('/ads', formData);
        toast.success('Ad created successfully');
      }
      setShowModal(false);
      fetchAds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save advertisement');
    }
  };

  const toggleActiveStatus = async (ad) => {
    try {
      await api.put(`/ads/${ad.id}`, { isActive: !ad.isActive });
      toast.success(`Ad ${!ad.isActive ? 'activated' : 'deactivated'}`);
      fetchAds();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad placement?')) return;
    try {
      await api.delete(`/ads/${id}`);
      toast.success('Ad deleted');
      fetchAds();
    } catch (err) {
      toast.error('Failed to delete ad');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary-600" />
            AdSense & Banner Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage high-converting AdSense script slots and custom image banner placements.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Ad Slot
        </button>
      </div>

      {/* Ads List Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading ads...</div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No advertisement units configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Placement</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      {ad.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-primary-600 dark:text-primary-400">
                      {ad.placement}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        ad.type === 'ADSENSE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {ad.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleActiveStatus(ad)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          ad.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {ad.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {ad.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(ad)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingAd ? 'Edit Ad Placement' : 'Create New Ad Placement'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ad Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Top Header Leaderboard"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Placement Area
                </label>
                <select
                  value={formData.placement}
                  onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p.id} value={p.id} className="dark:bg-gray-900">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ad Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200">
                    <input
                      type="radio"
                      name="adType"
                      value="IMAGE"
                      checked={formData.type === 'IMAGE'}
                      onChange={() => setFormData({ ...formData, type: 'IMAGE' })}
                    />
                    Custom Image Banner
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200">
                    <input
                      type="radio"
                      name="adType"
                      value="ADSENSE"
                      checked={formData.type === 'ADSENSE'}
                      onChange={() => setFormData({ ...formData, type: 'ADSENSE' })}
                    />
                    Google AdSense Unit
                  </label>
                </div>
              </div>

              {formData.type === 'IMAGE' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Target Link (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      placeholder="https://advertiser-link.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      AdSense Client ID (ca-pub-XXXXXXXXXXXXXXXX)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.adsenseClient}
                      onChange={(e) => setFormData({ ...formData, adsenseClient: e.target.value })}
                      placeholder="ca-pub-1234567890123456"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      AdSense Slot ID
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.adsenseSlot}
                      onChange={(e) => setFormData({ ...formData, adsenseSlot: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md"
                >
                  Save Ad Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsManager;
