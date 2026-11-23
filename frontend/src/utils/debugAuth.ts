// Debug utility untuk memeriksa authentication
export const debugAuth = () => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  console.log('🔍 Debug Authentication:');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'TIDAK ADA');
  console.log('User Data:', userData ? 'ADA' : 'TIDAK ADA');
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('User Info:', user);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  return {
    hasToken: !!token,
    hasUserData: !!userData,
    token: token
  };
};

export const testDanusAPI = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('❌ No token found');
    return;
  }
  
  try {
    const response = await fetch('https://nurverse.id/api/danus/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 DANUS API Test:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
    } else {
      const error = await response.text();
      console.error('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
};
