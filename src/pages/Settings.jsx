import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, Link as LinkIcon, Plus, Trash2, ArrowUp, ArrowDown, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import settingsService from '../services/settingsService';
import { extractError } from '../utils/helpers';

const Settings = () => {
  const [form, setForm] = useState({
    siteName: '',
    siteDescription: '',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '' },
    navItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await settingsService.get();
        const res = data.data || data;
        setForm((prev) => ({ ...prev, ...res, navItems: Array.isArray(res?.navItems) ? res.navItems : [] }));
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setSocial = (field) => (e) =>
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: e.target.value } }));

  const setNavItem = (index, field, value) =>
    setForm((prev) => {
      const navItems = [...(prev.navItems || [])];
      navItems[index] = { ...navItems[index], [field]: value };
      return { ...prev, navItems };
    });

  const addNavItem = () =>
    setForm((prev) => ({ ...prev, navItems: [...(prev.navItems || []), { id: `item-${Date.now()}`, label: '', href: '/' }] }));

  const removeNavItem = (index) =>
    setForm((prev) => ({ ...prev, navItems: (prev.navItems || []).filter((_, i) => i !== index) }));

  const moveNavItem = (index, dir) =>
    setForm((prev) => {
      const navItems = [...(prev.navItems || [])];
      const target = index + dir;
      if (target < 0 || target >= navItems.length) return prev;
      [navItems[index], navItems[target]] = [navItems[target], navItems[index]];
      return { ...prev, navItems };
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: res } = await settingsService.update(form);
      setForm(res.data || res);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Site Settings</h1>
        <div className="card p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Site Settings</h1>
        <Button icon={Save} onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* General */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <Globe className="w-4 h-4 text-primary-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">General</h2>
            </div>
            <Input label="Site Name" value={form.siteName} onChange={set('siteName')} />
            <div>
              <label className="label">Site Description</label>
              <textarea
                value={form.siteDescription}
                onChange={set('siteDescription')}
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <Input label="Logo URL" value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://..." />
            <Input label="Favicon URL" value={form.faviconUrl} onChange={set('faviconUrl')} placeholder="https://..." />
          </div>

          {/* Social Links */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <LinkIcon className="w-4 h-4 text-primary-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Social Links</h2>
            </div>
            <Input label="Facebook URL" value={form.socialLinks.facebook} onChange={setSocial('facebook')} placeholder="https://facebook.com/..." />
            <Input label="Twitter / X URL" value={form.socialLinks.twitter} onChange={setSocial('twitter')} placeholder="https://twitter.com/..." />
            <Input label="Instagram URL" value={form.socialLinks.instagram} onChange={setSocial('instagram')} placeholder="https://instagram.com/..." />
            <Input label="YouTube URL" value={form.socialLinks.youtube} onChange={setSocial('youtube')} placeholder="https://youtube.com/..." />
          </div>

          {/* Navigation Menu */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-primary-500" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Navigation Menu</h2>
              </div>
              <Button icon={Plus} size="sm" variant="secondary" onClick={addNavItem}>
                Add Item
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              These items appear in the single navbar of the website (desktop + mobile). Reorder with the arrows.
            </p>

            {form.navItems && form.navItems.length > 0 ? (
              <div className="space-y-3">
                {form.navItems.map((item, index) => (
                  <div key={item.id || index} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveNavItem(index, -1)}
                        className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === form.navItems.length - 1}
                        onClick={() => moveNavItem(index, 1)}
                        className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        label={`Item ${index + 1} — Label`}
                        value={item.label}
                        onChange={(e) => setNavItem(index, 'label', e.target.value)}
                        placeholder="e.g. राजनीति"
                      />
                      <Input
                        label="Link (URL)"
                        value={item.href}
                        onChange={(e) => setNavItem(index, 'href', e.target.value)}
                        placeholder="e.g. /politics or https://..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNavItem(index)}
                      className="p-2 mt-6 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">No menu items yet. Click "Add Item" to create one.</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <Mail className="w-4 h-4 text-primary-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contact</h2>
            </div>
            <Input label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="contact@example.com" />
            <Input label="Phone" value={form.contactPhone} onChange={set('contactPhone')} placeholder="+91-..." />
            <div>
              <label className="label">Address</label>
              <textarea
                value={form.address}
                onChange={set('address')}
                rows={3}
                className="input-field resize-none"
                placeholder="New Delhi, India"
              />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <Globe className="w-4 h-4 text-primary-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</h2>
            </div>
            <p className="text-xs text-gray-400 mt-3">Site name will appear in the browser tab and header.</p>
            {form.logoUrl && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Logo preview:</p>
                <img src={form.logoUrl} alt="" className="max-h-12 rounded" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
