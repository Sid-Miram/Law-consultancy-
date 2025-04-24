import React, { useState } from 'react';

export default function Login() {
  const [role, setRole] = useState('client');

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="">Login to Law Consultancy</h2>

        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 rounded-l-full border ${role === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleRoleChange('client')}
          >
            Client
          </button>
          <button
            className={`px-4 py-2 rounded-r-full border ${role === 'lawyer' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleRoleChange('lawyer')}
          >
            Lawyer
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 mt-4">
          <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
          <br />
          Don’t have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}
