import { useState, useEffect } from 'react';
import Register from '../components/Register';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-teal-600 to-blue-700 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      
      <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-green-600 to-teal-500 p-4 rounded-full mb-4 shadow-lg">
            <span className="text-6xl">🏔️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent mb-2">
            HIKE TRACKER
          </h1>
          <p className="text-gray-600 text-sm uppercase tracking-wider font-semibold">
            Explore. Track. Conquer.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowLogin(true)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              showLogin
                ? 'bg-gradient-to-r from-green-600 to-teal-500 text-white shadow-lg shadow-green-900/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              !showLogin
                ? 'bg-gradient-to-r from-green-600 to-teal-500 text-white shadow-lg shadow-green-900/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        {showLogin ? (
          <Login onSuccess={handleLoginSuccess} />
        ) : (
          <Register onSuccess={() => setShowLogin(true)} />
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          <p className="flex items-center justify-center gap-1">
            <span>🥾</span> Every Mountain Begins with a Single Step
          </p>
        </div>
      </div>
    </div>
  );
}