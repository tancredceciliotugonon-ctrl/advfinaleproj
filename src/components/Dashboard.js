import { useState } from 'react';
import HikeList from './HikeList';
import LogHike from './LogHike';
import TrailExplorer from './TrailExplorer';
import GearManager from './GearManager';
import Community from './Community';
import Profile from './Profile';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('hikes');
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('user') || '{}');
    }
    return {};
  });

  const tabs = [
    { id: 'hikes', label: 'My Hikes', icon: '🥾' },
    { id: 'log', label: 'Log Hike', icon: '➕' },
    { id: 'trails', label: 'Explore Trails', icon: '🗺️' },
    { id: 'gear', label: 'Gear', icon: '🎒' },
    { id: 'community', label: 'Community', icon: '💬' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/images/hiking-bg.jpg)' }}>
      {/* Dark overlay for text readability - Fixed */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none z-20"></div>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 via-teal-600 to-green-700 shadow-2xl sticky top-0 z-50 border-b-2 border-green-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-green-100 flex items-center justify-center text-green-700 text-xl font-bold border-3 border-white shadow-lg">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                🏔️ HIKE TRACKER
              </h1>
              <p className="text-sm text-green-100">Welcome, <span className="font-semibold">{user.username}</span>!</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-2 rounded-lg font-semibold transition-all border border-white/40 hover:border-white/60 shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/95 backdrop-blur shadow-lg sticky top-[72px] z-40 border-b-4 border-green-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-b-4 border-green-600 text-green-700 bg-gradient-to-b from-green-50 to-transparent'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {activeTab === 'hikes' && <HikeList />}
        {activeTab === 'log' && <LogHike onSuccess={() => setActiveTab('hikes')} />}
        {activeTab === 'trails' && <TrailExplorer />}
        {activeTab === 'gear' && <GearManager />}
        {activeTab === 'community' && <Community />}
        {activeTab === 'profile' && <Profile user={user} setUser={setUser} />}
      </main>
    </div>
  );
}