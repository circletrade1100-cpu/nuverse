import React, { useState } from 'react';
import { debugAuth, testDanusAPI } from '../../utils/debugAuth';
import { checkAndFixToken, refreshToken, autoFixAuth } from '../../utils/checkToken';
import { setFreshToken, autoSetFreshToken } from '../../utils/setFreshToken';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDebugAuth = () => {
    debugAuth();
  };

  const handleTestAPI = () => {
    testDanusAPI();
  };

  const handleCheckToken = () => {
    checkAndFixToken();
  };

  const handleRefreshToken = () => {
    refreshToken();
  };

  const handleAutoFix = () => {
    autoFixAuth();
  };

  const handleSetFreshToken = () => {
    setFreshToken();
  };

  const handleAutoSetFreshToken = () => {
    autoSetFreshToken();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">🐛 Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleDebugAuth}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Check Authentication
        </button>
        
        <button
          onClick={handleCheckToken}
          className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
        >
          Check Token
        </button>
        
        <button
          onClick={handleRefreshToken}
          className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
        >
          Refresh Token
        </button>
        
        <button
          onClick={handleAutoFix}
          className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
        >
          Auto Fix Auth
        </button>
        
        <button
          onClick={handleSetFreshToken}
          className="w-full bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-600"
        >
          Set Fresh Token
        </button>
        
        <button
          onClick={handleAutoSetFreshToken}
          className="w-full bg-pink-500 text-white px-3 py-2 rounded text-sm hover:bg-pink-600"
        >
          Auto Set Fresh Token
        </button>
        
        <button
          onClick={handleTestAPI}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
        >
          Test DANUS API
        </button>
        
        <div className="text-xs text-gray-500 mt-2">
          <p>Check console for debug output</p>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
