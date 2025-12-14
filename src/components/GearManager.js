import { useState, useEffect } from 'react';

export default function GearManager() {
  const [gearList, setGearList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'equipment',
    brand: '',
    weight_grams: '',
    notes: '',
    purchase_date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGear();
  }, []);

  const loadGear = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gear', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGearList(data.gear || []);
    } catch (error) {
      console.error('Error loading gear:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGear = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setGearList([...gearList, formData]);
      setFormData({ name: '', category: 'equipment', brand: '', weight_grams: '', notes: '', purchase_date: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding gear:', error);
    }
  };

  const handleDeleteGear = async (gearId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/gear/${gearId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGearList(gearList.filter(g => g.id !== gearId));
    } catch (error) {
      console.error('Error deleting gear:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading your gear...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 shadow-xl text-white flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-bold mb-2">🎒 Gear Manager</h2>
          <p className="text-orange-100">Manage and track your hiking equipment</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/30"
        >
          {showForm ? '✕ Cancel' : '➕ Add Gear'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddGear} className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-600 space-y-4">
          <input
            type="text"
            placeholder="Gear name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="equipment">Equipment</option>
            <option value="clothing">Clothing</option>
            <option value="safety">Safety</option>
          </select>
          <input
            type="number"
            placeholder="Weight (grams)"
            value={formData.weight_grams}
            onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            placeholder="Purchase date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            rows="3"
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Add Gear
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {gearList.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            No gear added yet
          </div>
        ) : (
          gearList.filter(g => g).map((gear) => (
            <div key={gear.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">{gear?.name || 'Unnamed'}</h3>
                <p className="text-sm text-gray-500">
                  {gear?.category || 'N/A'} {gear?.brand ? `• ${gear.brand}` : ''} {gear?.weight_grams ? `• ${gear.weight_grams}g` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDeleteGear(gear.id)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
