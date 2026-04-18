import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Smart Campus Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">{user?.name}</span>
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </span>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {user?.name}!</h2>
          <p className="text-lg text-gray-600">
            You are logged in as a <strong className="text-primary-600">{user?.role?.toLowerCase()}</strong>.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">User Information</h3>
              <div className="space-y-3">
                <p className="text-gray-600"><span className="font-semibold">Name:</span> {user?.name}</p>
                <p className="text-gray-600"><span className="font-semibold">Email:</span> {user?.email}</p>
                <p className="text-gray-600"><span className="font-semibold">Role:</span> {user?.role}</p>
                <p className="text-gray-600"><span className="font-semibold">User ID:</span> {user?.id}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user?.role === 'ADMIN' && (
                  <>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">Manage Users</button>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">System Settings</button>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">View Reports</button>
                  </>
                )}
                {user?.role === 'USER' && (
                  <>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">My Profile</button>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">Notifications</button>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">Book Resources</button>
                  </>
                )}
                {user?.role === 'TECHNICIAN' && (
                  <>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">Maintenance Tasks</button>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">Resource Status</button>
                    <button className="w-full btn-gradient text-white py-3 rounded-lg font-medium transition-all duration-300">Report Issues</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Available Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Authentication System</h4>
                <p className="text-gray-600 text-sm">Secure login and registration with role-based access control.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Role Management</h4>
                <p className="text-gray-600 text-sm">Dynamic role assignment and permission management.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">User Dashboard</h4>
                <p className="text-gray-600 text-sm">Personalized dashboard based on user roles and permissions.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-300">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">More Coming Soon</h4>
                <p className="text-gray-600 text-sm">Additional features will be added in future updates.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
