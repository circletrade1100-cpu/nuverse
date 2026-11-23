// Utility untuk memeriksa dan memperbaiki token
export const checkAndFixToken = async () => {
  const token = localStorage.getItem('auth_token');
  
  console.log('🔍 Checking token...');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'N/A');
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return false;
  }
  
  // Test token dengan API call
  try {
    const response = await fetch('https://nurverse.id/api/danus/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 API Test Response:');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token is valid!');
      console.log('Response:', data);
      return true;
    } else {
      console.log('❌ Token is invalid or expired');
      const errorText = await response.text();
      console.log('Error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
};

export const refreshToken = async () => {
  console.log('🔄 Attempting to refresh token...');
  
  // Try to get a new token by calling login API
  try {
    const response = await fetch('https://nurverse.id/api/auth/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sekolah-annur.id',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        console.log('✅ Token refreshed successfully!');
        return true;
      }
    }
    
    console.log('❌ Failed to refresh token');
    return false;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return false;
  }
};

// Auto-fix function
export const autoFixAuth = async () => {
  console.log('🔧 Auto-fixing authentication...');
  
  const isValid = await checkAndFixToken();
  if (isValid) {
    console.log('✅ Authentication is working!');
    return true;
  }
  
  console.log('🔄 Token invalid, attempting refresh...');
  const refreshed = await refreshToken();
  
  if (refreshed) {
    const isValidAfterRefresh = await checkAndFixToken();
    if (isValidAfterRefresh) {
      console.log('✅ Authentication fixed!');
      return true;
    }
  }
  
  console.log('❌ Could not fix authentication automatically');
  return false;
};
