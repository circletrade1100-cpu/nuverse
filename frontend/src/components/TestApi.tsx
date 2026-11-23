import React, { useState } from 'react';
import { testLogin, testGetUsers, testTUDashboard } from '../utils/testApi';
import { useAuth } from '../hooks/useAuth';

const TestApi: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, logout, isAuthenticated } = useAuth();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      await testLogin();
      addResult('✅ Login test berhasil');
    } catch (error) {
      addResult('❌ Login test gagal: ' + (error as Error).message);
    }
    setIsLoading(false);
  };

  const handleTestUsers = async () => {
    setIsLoading(true);
    try {
      const result = await testGetUsers();
      addResult(`✅ Get users berhasil: ${result.data.length} users ditemukan`);
    } catch (error) {
      addResult('❌ Get users gagal: ' + (error as Error).message);
    }
    setIsLoading(false);
  };

  const handleTestTU = async () => {
    setIsLoading(true);
    try {
      const result = await testTUDashboard();
      addResult(`✅ TU Dashboard berhasil: Saldo ${result.cash_balance}`);
    } catch (error) {
      addResult('❌ TU Dashboard gagal: ' + (error as Error).message);
    }
    setIsLoading(false);
  };

  const handleLoginWithHook = async () => {
    setIsLoading(true);
    try {
      const success = await login({
        email: 'admin@sekolah-annur.id',
        password: 'admin123'
      });
      if (success) {
        addResult('✅ Login dengan useAuth berhasil');
      } else {
        addResult('❌ Login dengan useAuth gagal');
      }
    } catch (error) {
      addResult('❌ Login dengan useAuth error: ' + (error as Error).message);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🧪 API Connection Test</h2>
        
        {/* User Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Status User:</h3>
          {isAuthenticated ? (
            <div className="text-green-600">
              ✅ Authenticated sebagai: <strong>{user?.name}</strong> ({user?.email})
              <button 
                onClick={() => logout()} 
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-red-600">❌ Belum authenticated</div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={handleLoginWithHook}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Login (Hook)
          </button>
          
          <button
            onClick={handleTestLogin}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Login
          </button>
          
          <button
            onClick={handleTestUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Users
          </button>
          
          <button
            onClick={handleTestTU}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test TU
          </button>
        </div>

        {/* Clear Button */}
        <div className="mb-4">
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mb-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span>Testing...</span>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <div className="font-bold mb-2">📋 Test Results:</div>
          {results.length === 0 ? (
            <div className="text-gray-500">Belum ada test yang dijalankan...</div>
          ) : (
            results.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>

        {/* API Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📡 API Information:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>Backend URL:</strong> {import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8000'}</li>
            <li><strong>API Base:</strong> {import.meta.env.PROD ? 'https://nurverse.id/api' : 'http://localhost:8000/api'}</li>
            <li><strong>Super Admin:</strong> admin@sekolah-annur.id / admin123</li>
            <li><strong>TU Staff:</strong> tu@sekolah-annur.id / tu123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestApi;
