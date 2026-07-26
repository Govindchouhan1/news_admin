import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sparkles,
  MapPin,
  Image,
  Layers,
  Save,
  Plus,
  Trash2,
  Tv,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SectionManager() {
  const [activeTab, setActiveTab] = useState('live_ticker');

  // Live Bar Settings State
  const [liveBar, setLiveBar] = useState({
    enabled: true,
    streamUrl: 'https://www.youtube-nocookie.com/embed/live_stream?channel=UC4208sD602X7y0yF74m04kg',
    customTicker: [
      'बड़ी खबर: भारत में डिजिटल मीडिया क्रांति, 24x7 ताज़ा समाचार अपडेट्स यहाँ देखें।',
      'शेयर बाजार में तेजी, सेंसेक्स और निफ्टी नए रिकॉर्ड स्तर पर पहुंचे।',
      'मौसम अपडेट: देश के कई राज्यों में बारिश का अलर्ट जारी, देखें अपने शहर का हाल।'
    ]
  });
  const [newTickerItem, setNewTickerItem] = useState('');

  // Astrology Horoscope State
  const [astrology, setAstrology] = useState({
    astrologerName: 'डॉ. आत्माराम शास्त्री',
    title: 'आज का राशिफल & ग्रह नक्षत्र स्थिति',
    zodiacs: {
      aries: 'मेष राशि: आज का दिन आर्थिक दृष्टिकोण से लाभप्रद रहेगा। नए प्रोजेक्ट्स शुरू करने के लिए समय उत्तम है।',
      taurus: 'वृषभ राशि: व्यावसायिक यात्रा के योग बन रहे हैं। परिवार में खुशहाली रहेगी।',
      gemini: 'मिथुन राशि: कार्यक्षेत्र में सहकर्मियों का सहयोग मिलेगा। स्वास्थ्य का ध्यान रखें।',
      cancer: 'कर्क राशि: व्यापार में सकारात्मक बदलाव देखने को मिलेंगे। धन लाभ के अवसर प्राप्त होंगे।',
      leo: 'सिंह राशि: समाज में मान-सम्मान बढ़ेगा। रुका हुआ धन वापस मिलने की संभावना है।',
      virgo: 'कन्या राशि: नए कार्य की शुरुआत के लिए अनुकूल समय। करियर में तरक्की होगी।',
      libra: 'तुला राशि: पारिवारिक जीवन में सुख-शांति बनी रहेगी। निवेश से लाभ होगा।',
      scorpio: 'वृश्चिक राशि: स्वास्थ्य में सुधार होगा। पुरानी समस्याओं का समाधान मिलेगा।',
      sagittarius: 'धनु राशि: धार्मिक कार्यों में रुचि बढ़ेगी। यात्रा के योग बन रहे हैं।',
      capricorn: 'मकर राशि: व्यापार में वृद्धि होगी। मित्रों का सहयोग प्राप्त होगा।',
      aquarius: 'कुंभ राशि: अचानक धन लाभ हो सकता है। नए संबंध स्थापित होंगे।',
      pisces: 'मीन राशि: मानसिक शांति मिलेगी। शिक्षा और प्रतियोगिता में सफलता प्राप्त होगी।'
    }
  });

  // Regional News States
  const [regionalStates] = useState([
    { id: 'up', name: 'उत्तर प्रदेश (UP)', active: true, newsCount: 18 },
    { id: 'bihar', name: 'बिहार (Bihar)', active: true, newsCount: 14 },
    { id: 'delhi', name: 'दिल्ली NCR', active: true, newsCount: 22 },
    { id: 'mp', name: 'मध्य प्रदेश (MP)', active: true, newsCount: 10 },
    { id: 'rajasthan', name: 'राजस्थान', active: true, newsCount: 12 }
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_section_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.liveBar) setLiveBar(parsed.liveBar);
        if (parsed.astrology) setAstrology(parsed.astrology);
      }
    } catch (err) {
      console.error("Error loading section settings:", err);
    }
  }, []);

  const handleAddTicker = () => {
    if (!newTickerItem.trim()) return;
    setLiveBar((prev) => ({
      ...prev,
      customTicker: [...prev.customTicker, newTickerItem.trim()]
    }));
    setNewTickerItem('');
    toast.success('नया लाइव टिकर संदेश जोड़ा गया');
  };

  const handleRemoveTicker = (index) => {
    setLiveBar((prev) => ({
      ...prev,
      customTicker: prev.customTicker.filter((_, i) => i !== index)
    }));
    toast.success('टिकर संदेश हटाया गया');
  };

  const handleSaveSettings = () => {
    try {
      const settings = { liveBar, astrology, regionalStates };
      localStorage.setItem('app_section_settings', JSON.stringify(settings));
      toast.success('सभी सेक्शन अपडेट्स सफलतापूर्वक सुरक्षित किए गए!');
    } catch (err) {
      toast.error('सेटिंग्स सुरक्षित करने में त्रुटि हुई');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-600" />
            <span>होमपेज सेक्शन & लाइव न्यूज़ प्रबंधक</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            वेबसाइट के लाइव टिकर, ज्योतिष/राशिफल, प्रादेशिक ख़बरें और विजेट्स का प्रबंधन करें।
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>सुरक्षित करें (Save Changes)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {[
          { id: 'live_ticker', label: 'लाइव टीवी & टिकर', icon: Radio },
          { id: 'astrology', label: 'राशिफल & ज्योतिष', icon: Sparkles },
          { id: 'regional', label: 'राज्य/प्रादेशिक न्यूज़', icon: MapPin },
          { id: 'galleries', label: 'फोटो गैलरी & स्टोरीज़', icon: Image },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Live Ticker & Stream */}
      {activeTab === 'live_ticker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-red-600" />
                <span>लाइव न्यूज़ टिकर संदेश सूची</span>
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={liveBar.enabled}
                  onChange={(e) => setLiveBar({ ...liveBar, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {liveBar.enabled ? 'सक्रिय' : 'निष्क्रिय'}
                </span>
              </label>
            </div>

            {/* Add New Ticker Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTickerItem}
                onChange={(e) => setNewTickerItem(e.target.value)}
                placeholder="नया ब्रेकिंग लाइव संदेश दर्ज करें..."
                className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddTicker}
                className="flex items-center gap-1 bg-red-600 text-white font-bold text-xs px-3 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>जोड़ें</span>
              </button>
            </div>

            {/* Ticker List */}
            <div className="space-y-2">
              {liveBar.customTicker.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 text-xs"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    {item}
                  </span>
                  <button
                    onClick={() => handleRemoveTicker(idx)}
                    className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live TV Stream Config */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-600" />
              <span>लाइव TV स्ट्रीम URL</span>
            </h2>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-medium">YouTube Live Stream Embed Link</label>
              <input
                type="text"
                value={liveBar.streamUrl}
                onChange={(e) => setLiveBar({ ...liveBar, streamUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
              <iframe
                src={liveBar.streamUrl}
                title="Live Stream Preview"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Astrology & Daily Horoscope */}
      {activeTab === 'astrology' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">ज्योतिषी का नाम</label>
              <input
                type="text"
                value={astrology.astrologerName}
                onChange={(e) => setAstrology({ ...astrology, astrologerName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">राशिफल मुख्य शीर्षक</label>
              <input
                type="text"
                value={astrology.title}
                onChange={(e) => setAstrology({ ...astrology, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              12 राशियां दैनिक भविष्यफल (Zodiac Forecast)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(astrology.zodiacs).map(([key, val]) => {
                const ZODIAC_LABELS = {
                  aries: 'मेष (Aries)',
                  taurus: 'वृषभ (Taurus)',
                  gemini: 'मिथुन (Gemini)',
                  cancer: 'कर्क (Cancer)',
                  leo: 'सिंह (Leo)',
                  virgo: 'कन्या (Virgo)',
                  libra: 'तुला (Libra)',
                  scorpio: 'वृश्चिक (Scorpio)',
                  sagittarius: 'धनु (Sagittarius)',
                  capricorn: 'मकर (Capricorn)',
                  aquarius: 'कुंभ (Aquarius)',
                  pisces: 'मीन (Pisces)'
                };
                return (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">
                      {ZODIAC_LABELS[key] || key}
                    </label>
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) =>
                        setAstrology({
                          ...astrology,
                          zodiacs: { ...astrology.zodiacs, [key]: e.target.value }
                        })
                      }
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Regional News */}
      {activeTab === 'regional' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">राज्यवार समाचार हब (Regional State Hubs)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalStates.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{st.name}</h4>
                  <span className="text-[10px] text-gray-500">{st.newsCount} सक्रिय खबरें</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  सक्रिय
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Photo Galleries & Web Stories */}
      {activeTab === 'galleries' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">फोटो गैलरी & वेब स्टोरी प्रबंधन</h2>
          <p className="text-xs text-gray-500">
            होमपेज विजुअल स्टोरी कारौसेल और फोटो गैलरी विजेट्स के लिए सामग्री अपडेट करें।
          </p>
          <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              नई फोटो गैलरी या वेब स्टोरी बनाने के लिए यहाँ अपलोड करें
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
