import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, Link as LinkIcon } from 'lucide-react';
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await settingsService.get();
        setForm(data.data || data);
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
