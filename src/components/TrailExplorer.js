import { useState, useEffect } from 'react';

export default function TrailExplorer() {
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, review_text: '' });
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrails();
  }, []);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredTrails(trails);
    } else {
      setFilteredTrails(trails.filter(t => t.difficulty === filter));
    }
  }, [filter, trails]);

  const fetchTrails = async () => {
    try {
      const response = await fetch('/api/trails');
      const data = await response.json();
      if (response.ok) {
        setTrails(data.trails || []);
        setFilteredTrails(data.trails || []);
      } else {
        setTrails([]);
        setFilteredTrails([]);
      }
    } catch (error) {
      console.error('Failed to load trails:', error);
      setTrails([]);
      setFilteredTrails([]);
    } finally {
      setLoading(false);
    }
  };

  const viewTrailDetails = async (trail) => {
    setSelectedTrail(trail);
    try {
      const response = await fetch(`/api/trails/${trail.id}/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const addReview = async () => {
    if (!newReview.review_text.trim()) {
      alert('Please write a review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trails/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trail_id: selectedTrail.id,
          ...newReview
        })
      });

      if (response.ok) {
        setNewReview({ rating: 5, review_text: '' });
        viewTrailDetails(selectedTrail);
      }
    } catch (error) {
      alert('Failed to add review');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Hard': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Expert': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading trails...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-8 shadow-xl text-white">
        <h2 className="text-4xl font-bold mb-2">Explore Trails</h2>
        <p className="text-green-100 text-lg">Discover amazing hiking destinations in the Philippines</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Easy', 'Moderate', 'Hard', 'Expert'].map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setFilter(difficulty)}
            className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              filter === difficulty
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            {difficulty}
          </button>
        ))}
      </div>

      {/* Trail Count */}
      <p className="text-gray-600">
        Showing <span className="font-bold text-green-600">{filteredTrails.length}</span> trail{filteredTrails.length !== 1 ? 's' : ''}
      </p>

      {/* Trails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrails.map((trail) => (
          <div
            key={trail.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
            onClick={() => viewTrailDetails(trail)}
          >
            <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-6xl">
              🏔️
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition flex-1">
                  {trail.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(trail.difficulty)}`}>
                  {trail.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4">📍 {trail.location}</p>
              
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-600">Distance</p>
                  <p className="font-bold text-blue-700">{trail.distance_km} km</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                  <p className="text-xs text-orange-600">Elevation</p>
                  <p className="font-bold text-orange-700">{trail.elevation_gain_m} m</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-xs text-purple-600">Time</p>
                  <p className="font-bold text-purple-700">{trail.estimated_time_hours} hrs</p>
                </div>
              </div>
              
              <p className="mt-4 text-gray-700 text-sm line-clamp-2">{trail.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trail Detail Modal */}
      {selectedTrail && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTrail(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{selectedTrail.name}</h3>
                <p className="text-gray-600 text-lg">📍 {selectedTrail.location}</p>
              </div>
              <button
                onClick={() => setSelectedTrail(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl"
              >
                ✕
              </button>
            </div>

            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border mb-6 ${getDifficultyColor(selectedTrail.difficulty)}`}>
              {selectedTrail.difficulty}
            </span>

            <p className="text-gray-700 mb-6 text-lg">{selectedTrail.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-1">Distance</p>
                <p className="text-3xl font-bold text-blue-700">{selectedTrail.distance_km}</p>
                <p className="text-xs text-blue-600">kilometers</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600 mb-1">Elevation Gain</p>
                <p className="text-3xl font-bold text-orange-700">{selectedTrail.elevation_gain_m}</p>
                <p className="text-xs text-orange-600">meters</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 mb-1">Est. Time</p>
                <p className="text-3xl font-bold text-purple-700">{selectedTrail.estimated_time_hours}</p>
                <p className="text-xs text-purple-600">hours</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 mb-1">Trail Type</p>
                <p className="text-lg font-bold text-green-700">{selectedTrail.trail_type}</p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t pt-6">
              <h4 className="text-2xl font-bold mb-4">Reviews ({reviews.length})</h4>
              
              {/* Add Review */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="font-semibold mb-3">Leave a Review</p>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className={`text-2xl transition ${
                        newReview.rating >= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReview.review_text}
                  onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 mb-3"
                  rows="3"
                  placeholder="Share your experience..."
                />
                <button
                  onClick={addReview}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Post Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{review.username}</span>
                      <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-gray-700">{review.review_text}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}