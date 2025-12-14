import { useState, useEffect } from 'react';

export default function Profile({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setProfilePicture(data.user.profile_picture);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });

      const data = await response.json();
      if (response.ok) {
        setProfilePicture(data.profile_picture);
        const updatedUser = { ...user, profile_picture: data.profile_picture };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert('Failed to upload picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading picture');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">👤 Your Profile</h2>
            <p className="text-purple-100">View and manage your hiking journey</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/30"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-pink-600">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-pink-600 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-pink-600 shadow-lg">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-700 mb-4">Update your profile picture to personalize your hiking profile</p>
            <label className="inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer hover:bg-pink-700 transition disabled:opacity-50">
                {uploading ? '⏳ Uploading...' : '📸 Choose Picture'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm font-semibold mb-2">Total Hikes</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{stats.total_hikes || 0}</span>
              <span className="text-green-200 text-lg">adventures</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-semibold mb-2">Distance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{parseFloat(stats.total_distance || 0).toFixed(1)}</span>
              <span className="text-blue-200 text-lg">km</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-orange-100 text-sm font-semibold mb-2">Elevation Gain</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{stats.total_elevation || 0}</span>
              <span className="text-orange-200 text-lg">m</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-purple-600">
        {!isEditing ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Username</h3>
              <p className="text-xl font-bold text-gray-800 mt-1">{user?.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Email</h3>
              <p className="text-lg text-gray-700 mt-1">{user?.email}</p>
            </div>
            {user?.location && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Location</h3>
                <p className="text-lg text-gray-700 mt-1">{user.location}</p>
              </div>
            )}
            {user?.bio && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Bio</h3>
                <p className="text-lg text-gray-700 mt-1">{user.bio}</p>
              </div>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="e.g., Philippines"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
