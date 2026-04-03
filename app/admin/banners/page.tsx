'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Banner } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfileAndBanners();
  }, []);

  const fetchProfileAndBanners = async () => {
    try {
      const { ok, data } = await api.auth.getProfile();
      if (!ok || data.data.user.role !== 'admin') {
        toast.error("Unauthorized access.");
        router.push('/');
        return;
      }
      setUser(data.data.user);
      
      const bannerRes = await api.banners.list();
      if (bannerRes.ok) {
        setBanners(bannerRes.data.data.banners);
      }
    } catch (err) {
      toast.error("Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBanner = async (bannerData: any) => {
    try {
      const { ok, data } = editingBanner
        ? await api.banners.update(editingBanner.id, bannerData)
        : await api.banners.create(bannerData);

      if (ok) {
        toast.success(editingBanner ? "Banner updated!" : "Banner created!");
        const bannerRes = await api.banners.list();
        if (bannerRes.ok) setBanners(bannerRes.data.data.banners);
        setIsModalOpen(false);
        setEditingBanner(null);
      } else {
        toast.error(data.status?.message || "Failed to save banner.");
      }
    } catch (err) {
      toast.error("Save failed.");
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const { ok } = await api.banners.delete(id);
      if (ok) {
        toast.success("Banner deleted.");
        setBanners(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold serif text-[#1A142E] mb-2">Banner Management</h1>
            <p className="text-sm text-[#6B6580]">Configure your homepage hero carousel.</p>
          </div>
          <button 
            onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}
            className="bg-[#1A142E] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all"
          >
            + Create New
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {banners.map(banner => (
            <div key={banner.id} className="bg-white border border-gray-50 rounded-[2.5rem] p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center group relative overflow-hidden">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${banner.active ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                    {banner.active ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-purple-50 text-[#8B7BB4] px-2 py-1 rounded-full">
                    Position: {banner.position}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 px-2 py-1 rounded-full">
                    Align: {banner.text_align}
                  </span>
                </div>
                <h3 className="text-xl font-bold serif text-[#1A142E] mb-1">{banner.title}</h3>
                <p className="text-xs text-[#6B6580] line-clamp-2">{banner.description}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setEditingBanner(banner); setIsModalOpen(true); }}
                  className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-purple-50 hover:text-[#8B7BB4] transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button 
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-md">
            <div className="bg-white/90 backdrop-blur-3xl border border-white rounded-[3.5rem] p-10 max-w-[600px] w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h3 className="text-2xl font-bold serif text-[#1A142E] mb-8">{editingBanner ? 'Edit Banner' : 'New Banner'}</h3>
              <BannerForm 
                initialData={editingBanner}
                onSave={handleSaveBanner}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function BannerForm({ initialData, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    badge_text: initialData?.badge_text || '',
    description: initialData?.description || '',
    button_text: initialData?.button_text || 'Discover Collection',
    button_link: initialData?.button_link || '/browse',
    image_url: initialData?.image_url || '',
    position: initialData?.position || 0,
    active: initialData?.active ?? true,
    text_align: initialData?.text_align || 'left'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Main Title</label>
          <input 
            type="text" required value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Subtitle / Drop Info</label>
          <input 
            type="text" value={formData.subtitle} 
            onChange={e => setFormData({...formData, subtitle: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Background Image URL</label>
        <input 
          type="text" required value={formData.image_url} 
          onChange={e => setFormData({...formData, image_url: e.target.value})}
          className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          placeholder="Unsplash URL, etc."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Description</label>
        <textarea 
          required value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4] min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Text Alignment</label>
          <select 
            value={formData.text_align}
            onChange={e => setFormData({...formData, text_align: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Position</label>
          <input 
            type="number" value={formData.position} 
            onChange={e => setFormData({...formData, position: parseInt(e.target.value)})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-2">
        <input 
          type="checkbox" checked={formData.active} 
          onChange={e => setFormData({...formData, active: e.target.checked})}
          id="is_active" className="rounded text-[#8B7BB4] border-gray-200"
        />
        <label htmlFor="is_active" className="text-[9px] font-black uppercase tracking-widest text-gray-500 cursor-pointer">Visible to public</label>
      </div>

      <div className="pt-6 flex gap-4">
        <button type="submit" className="flex-1 bg-[#1A142E] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg">
          {initialData ? 'Update Banner' : 'Create Banner'}
        </button>
        <button type="button" onClick={onCancel} className="px-10 bg-white border border-gray-100 text-[#6B6580] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">
          Cancel
        </button>
      </div>
    </form>
  );
}
