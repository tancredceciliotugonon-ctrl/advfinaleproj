import { useState, useEffect } from 'react';

export default function LogHike({ onSuccess }) {
  const [trails, setTrails] = useState([]);
  const [formData, setFormData] = useState({
    trail_id: '',
    custom_trail_name: '',
    hike_date: new Date().toISOString().split('T')[0],
    duration_hours: '',
    distance_km: '',
    elevation_gain_m: '',
    difficulty_rating: 3,
    weather_conditions: '',
    temperature_celsius: '',
    notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    try {
      const response = await fetch('/api/trails');
      const data = await response.json();
      if (response.ok) {
        setTrails(data.trails || []);
      } else {
        setTrails([]);
      }
    } catch (error) {
      console.error('Failed to load trails:', error);
      setTrails([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hikes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Hike logged successfully!');
        setFormData({
          trail_id: '',
          custom_trail_name: '',
          hike_date: new Date().toISOString().split('T')[0],
          duration_hours: '',
          distance_km: '',
          elevation_gain_m: '',
          difficulty_rating: 3,
          weather_conditions: '',
          temperature_celsius: '',
          notes: ''
        });
        setTimeout(() => onSuccess(), 1500);
      } else {
        setMessage(data.error || 'Failed to log hike');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedTrail = trails.find(t => t.id == formData.trail_id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-8 shadow-xl text-white mb-8">
        <h2 className="text-4xl font-bold mb-2">Log a New Hike</h2>
        <p className="text-green-100 text-lg">Record your adventure and preserve the memories</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Trail Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            🗺️ Select Trail (or enter custom below)
          </label>
          <select
            value={formData.trail_id}
            onChange={(e) => {
              const trail = trails.find(t => t.id == e.target.value);
              setFormData({
                ...formData,
                trail_id: e.target.value,
                distance_km: trail?.distance_km || '',
                elevation_gain_m: trail?.elevation_gain_m || ''
              });
            }}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
          >
            <option value="">Choose a trail...</option>
            {trails.map((trail) => (
              <option key={trail.id} value={trail.id}>
                {trail.name} - {trail.location} ({trail.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Trail Name */}
        {!formData.trail_id && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Or Enter Custom Trail Name
            </label>
            <input
              type="text"
              value={formData.custom_trail_name}
              onChange={(e) => setFormData({ ...formData, custom_trail_name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="My Secret Trail"
            />
          </div>
        )}

        {/* Date and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">📅 Hike Date</label>
            <input
              type="date"
              value={formData.hike_date}
              onChange={(e) => setFormData({ ...formData, hike_date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">⏱️ Duration (hours)</label>
            <input
              type="number"
              step="0.1"
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="3.5"
            />
          </div>
        </div>

        {/* Distance and Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">📏 Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={formData.distance_km}
              onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="8.5"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">⛰️ Elevation Gain (m)</label>
            <input
              type="number"
              value={formData.elevation_gain_m}
              onChange={(e) => setFormData({ ...formData, elevation_gain_m: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="650"
            />
          </div>
        </div>

        {/* Difficulty Rating */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            ⭐ Difficulty Rating (1-5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, difficulty_rating: rating })}
                className={`flex-1 py-3 rounded-xl font-bold transition ${
                  formData.difficulty_rating >= rating
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">🌤️ Weather</label>
            <input
              type="text"
              value={formData.weather_conditions}
              onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="Sunny, partly cloudy"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">🌡️ Temperature (°C)</label>
            <input
              type="number"
              value={formData.temperature_celsius}
              onChange={(e) => setFormData({ ...formData, temperature_celsius: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="25"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            rows="4"
            placeholder="Describe your experience, highlights, challenges..."
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:from-green-500 hover:to-teal-400 disabled:opacity-50 transition-all shadow-lg"
        >
          {loading ? '⏳ Logging Hike...' : '🏔️ Log Hike'}
        </button>
      </form>
    </div>
  );
}