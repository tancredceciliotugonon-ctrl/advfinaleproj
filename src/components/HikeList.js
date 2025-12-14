import { useState, useEffect } from 'react';

export default function HikeList() {
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHike, setSelectedHike] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchHikes();
  }, []);

  const fetchHikes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hikes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHikes(data.hikes || []);
      } else {
        console.error('Hikes error:', data);
        setHikes([]);
      }
    } catch (error) {
      console.error('Failed to load hikes:', error);
      setHikes([]);
    } finally {
      setLoading(false);
    }
  };

  const viewHikeDetails = async (hike) => {
    setSelectedHike(hike);
    try {
      const response = await fetch(`/api/hikes/${hike.id}/photos`);
      const data = await response.json();
      if (response.ok) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Failed to load photos');
    }
  };

  const deleteHike = async (hikeId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this hike?')) return;

    setDeleting(hikeId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hikes/${hikeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHikes(hikes.filter(h => h.id !== hikeId));
      }
    } catch (error) {
      alert('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const getStats = () => {
    const totalDistance = hikes.reduce((sum, h) => sum + (parseFloat(h.distance_km) || 0), 0);
    const totalElevation = hikes.reduce((sum, h) => sum + (parseInt(h.elevation_gain_m) || 0), 0);
    const totalTime = hikes.reduce((sum, h) => sum + (parseFloat(h.duration_hours) || 0), 0);
    return { totalDistance, totalElevation, totalTime };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading your adventures...</p>
      </div>
    );
  }

  if (hikes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block bg-white rounded-3xl p-12 shadow-xl">
          <div className="text-8xl mb-6">🏔️</div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">No Hikes Yet!</h3>
          <p className="text-gray-600 text-lg mb-6">Your adventure awaits</p>
          <div className="bg-gradient-to-r from-green-600 to-teal-500 text-white px-8 py-3 rounded-xl font-bold inline-block">
            Click "Log Hike" to start tracking
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-8 shadow-xl text-white">
        <h2 className="text-4xl font-bold mb-6">Your Hiking Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-green-100 text-sm mb-1">Total Hikes</p>
            <p className="text-4xl font-bold">{hikes.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-green-100 text-sm mb-1">Distance</p>
            <p className="text-4xl font-bold">{stats.totalDistance.toFixed(1)}</p>
            <p className="text-green-100 text-xs">km</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-green-100 text-sm mb-1">Elevation Gain</p>
            <p className="text-4xl font-bold">{stats.totalElevation}</p>
            <p className="text-green-100 text-xs">meters</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-green-100 text-sm mb-1">Time</p>
            <p className="text-4xl font-bold">{stats.totalTime.toFixed(1)}</p>
            <p className="text-green-100 text-xs">hours</p>
          </div>
        </div>
      </div>

      {/* Hikes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hikes.map((hike) => (
          <div
            key={hike.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
            onClick={() => viewHikeDetails(hike)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition">
                    {hike.trail_name || hike.custom_trail_name || 'Unnamed Trail'}
                  </h3>
                  <p className="text-gray-600 mt-1">{hike.location || 'Unknown Location'}</p>
                </div>
                <button
                  onClick={(e) => deleteHike(hike.id, e)}
                  disabled={deleting === hike.id}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                >
                  {deleting === hike.id ? '⏳' : '🗑️'}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  hike.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  hike.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  hike.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {hike.difficulty || 'N/A'}
                </span>
                <span className="text-gray-600">📅 {new Date(hike.hike_date).toLocaleDateString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {hike.distance_km && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">Distance</p>
                    <p className="text-xl font-bold text-blue-700">{hike.distance_km} km</p>
                  </div>
                )}
                {hike.elevation_gain_m && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 mb-1">Elevation</p>
                    <p className="text-xl font-bold text-orange-700">{hike.elevation_gain_m} m</p>
                  </div>
                )}
                {hike.duration_hours && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 mb-1">Duration</p>
                    <p className="text-xl font-bold text-purple-700">{hike.duration_hours} hrs</p>
                  </div>
                )}
              </div>

              {hike.notes && (
                <p className="mt-4 text-gray-700 italic text-sm line-clamp-2">"{hike.notes}"</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedHike && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedHike(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {selectedHike.trail_name || selectedHike.custom_trail_name}
                </h3>
                <p className="text-gray-600 mt-1">{selectedHike.location}</p>
              </div>
              <button
                onClick={() => setSelectedHike(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Distance</p>
                <p className="text-2xl font-bold text-blue-700">{selectedHike.distance_km} km</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1">Elevation</p>
                <p className="text-2xl font-bold text-orange-700">{selectedHike.elevation_gain_m} m</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 mb-1">Duration</p>
                <p className="text-2xl font-bold text-purple-700">{selectedHike.duration_hours} hrs</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Rating</p>
                <p className="text-2xl font-bold text-green-700">{'⭐'.repeat(selectedHike.difficulty_rating || 0)}</p>
              </div>
            </div>

            {selectedHike.weather_conditions && (
              <div className="bg-sky-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-sky-600 mb-1">Weather</p>
                <p className="text-lg text-sky-700">{selectedHike.weather_conditions} {selectedHike.temperature_celsius && `• ${selectedHike.temperature_celsius}°C`}</p>
              </div>
            )}

            {selectedHike.notes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Notes</p>
                <p className="text-gray-800">{selectedHike.notes}</p>
              </div>
            )}

            {photos.length > 0 && (
              <div>
                <h4 className="text-xl font-bold mb-4">Photos ({photos.length})</h4>
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <p className="mt-2 text-sm text-gray-600">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}