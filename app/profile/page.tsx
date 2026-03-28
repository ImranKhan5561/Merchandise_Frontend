'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [activeTab, setActiveTab] = useState('account');

  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    try {
      const { ok, data } = await api.auth.getProfile();
      if (ok) {
        setUser(data.data.user);
        setEditName(data.data.user.name);
        setEditEmail(data.data.user.email);
      } else {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-change'));
        router.push('/login');
      }
    } catch (err) {
      toast.error("Failed to fetch profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { ok, data } = await api.addresses.list();
      if (ok) {
        setAddresses(data.data.addresses);
      }
    } catch (err) {
      console.error("Failed to fetch addresses");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { ok, data } = await api.auth.updateProfile(editName, editEmail);
      if (ok) {
        toast.success("Profile updated! ✨");
        setUser(data.data.user);
        setIsProfileModalOpen(false);
        if (editEmail !== user.email) {
          toast.info("Verification required for new email.");
        }
      } else {
        toast.error(data.status?.message || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const { ok, data } = editingAddress
        ? await api.addresses.update(editingAddress.id, addressData)
        : await api.addresses.create(addressData);

      if (ok) {
        toast.success(editingAddress ? "Address updated!" : "Address added!");
        fetchAddresses();
        setIsAddressModalOpen(false);
        setEditingAddress(null);
      } else {
        toast.error(data.status?.message || "Failed to save address.");
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const { ok } = await api.addresses.delete(id);
      if (ok) {
        toast.success("Address removed.");
        fetchAddresses();
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleLogout = async () => {
    try {
      const { ok } = await api.auth.logout();
      if (ok) {
        toast.success("Logged out successfully. ✨");
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-purple-50 rounded-full" />
            <div className="h-4 w-32 bg-purple-50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Profile Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[3.5rem] p-10 shadow-2xl shadow-purple-100/50 relative overflow-hidden text-center sticky top-32">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-50/40 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-32 h-32 bg-gradient-to-tr from-[#8B7BB4] to-[#C8A2C8] rounded-full mx-auto mb-6 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#8B7BB4] to-[#C8A2C8] flex items-center justify-center text-white text-4xl font-serif">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl font-bold serif text-[#1A142E] mb-1">{user.name}</h1>
                <p className="text-sm text-[#6B6580] mb-8">{user.email}</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="w-full bg-[#1A142E] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-purple-900/10 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0"
                  >
                    Edit Profile
                  </button>
                  <Link
                    href="/orders/track"
                    className="w-full bg-white border border-purple-100 text-[#8B7BB4] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-purple-50 transition-all text-center block"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-white border border-gray-100 text-[#6B6580] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-2 shadow-sm flex gap-2 overflow-x-auto scrollbar-none sticky top-32 z-20">
              {['account', 'addresses'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#1A142E] text-white shadow-xl shadow-purple-900/10'
                      : 'text-[#8B7BB4] hover:bg-white hover:text-[#1A142E]'
                  }`}
                >
                  {tab === 'account' ? 'My Account' : 'Addresses'}
                </button>
              ))}
            </div>

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-[3.5rem] p-10 shadow-xl shadow-purple-100/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold serif text-[#1A142E] mb-8">Account Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] block mb-2">Member Since</label>
                    <p className="text-[#1A142E] font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] block mb-2">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.is_verified ? 'bg-green-400' : 'bg-orange-400'}`} />
                      <p className="text-[#1A142E] font-medium">{user.is_verified ? 'Verified Account' : 'Pending Verification'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-[3.5rem] p-10 shadow-xl shadow-purple-100/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold serif text-[#1A142E]">Manage Addresses</h2>
                  <button
                    onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] hover:text-[#1A142E] transition-colors"
                  >
                    + Add New
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div key={addr.id} className="p-6 bg-white/40 border border-white rounded-3xl relative group">
                        {addr.is_default && (
                          <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest bg-purple-100 text-[#8B7BB4] px-2 py-1 rounded-full">Default</span>
                        )}
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] mb-3">{addr.address_type}</h3>
                        <p className="text-[#1A142E] font-medium text-sm mb-1">{addr.address_line_1}</p>
                        {addr.address_line_2 && <p className="text-[#1A142E] font-medium text-sm mb-1">{addr.address_line_2}</p>}
                        <p className="text-[#6B6580] text-xs">{addr.city}, {addr.state} {addr.postal_code}</p>
                        <p className="text-[#6B6580] text-xs mb-4">{addr.country}</p>

                        <div className="flex gap-4 pt-4 border-t border-white/20">
                          <button
                            onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                            className="text-[9px] font-bold uppercase tracking-widest text-[#8B7BB4] hover:text-[#1A142E]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-[9px] font-bold uppercase tracking-widest text-red-300 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-sm text-[#6B6580]">No saved addresses.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Modal */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/5 backdrop-blur-md">
            <div className="bg-white/90 backdrop-blur-3xl border border-white rounded-[3rem] p-10 max-w-[440px] w-full shadow-2xl relative">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-8 right-8 text-gray-300 hover:text-gray-500"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h3 className="text-2xl font-bold serif text-[#1A142E] mb-8">Edit Profile</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white/50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] outline-none focus:border-[#8B7BB4] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white/50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] outline-none focus:border-[#8B7BB4] transition-all"
                  />
                  <p className="text-[9px] text-gray-400 ml-2">Changing email will require re-verification.</p>
                </div>
                <button className="w-full bg-[#1A142E] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Address Modal */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/5 backdrop-blur-md">
            <div className="bg-white/90 backdrop-blur-3xl border border-white rounded-[3rem] p-10 max-w-[500px] w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="absolute top-8 right-8 text-gray-300 hover:text-gray-500"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <h3 className="text-2xl font-bold serif text-[#1A142E] mb-8">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
              <AddressForm
                initialData={editingAddress}
                onSave={handleSaveAddress}
                onCancel={() => setIsAddressModalOpen(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AddressForm({ initialData, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    address_type: initialData?.address_type || 'Home',
    address_line_1: initialData?.address_line_1 || '',
    address_line_2: initialData?.address_line_2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'United States',
    is_default: initialData?.is_default || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Type</label>
          <select
            value={formData.address_type}
            onChange={(e) => setFormData({...formData, address_type: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          >
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
              className="w-4 h-4 rounded border-gray-200 text-[#8B7BB4] focus:ring-[#8B7BB4]"
            />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B6580]">Set as Default</span>
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Street Address</label>
        <input
          type="text" required value={formData.address_line_1}
          onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
          className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          placeholder="123 Ethereal Lane"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Apt / Suite (Optional)</label>
        <input
          type="text" value={formData.address_line_2}
          onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
          className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          placeholder="Suite 404"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">City</label>
          <input
            type="text" required value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">State / Province</label>
          <input
            type="text" required value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Postal Code</label>
          <input
            type="text" required value={formData.postal_code}
            onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7BB4] ml-2">Country</label>
          <input
            type="text" required value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-5 text-xs outline-none focus:border-[#8B7BB4]"
          />
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <button type="submit" className="flex-1 bg-[#1A142E] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] shadow-lg">
          Save Address
        </button>
        <button type="button" onClick={onCancel} className="px-8 bg-white border border-gray-100 text-[#6B6580] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px]">
          Cancel
        </button>
      </div>
    </form>
  );
}
