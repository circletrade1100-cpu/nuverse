// Utility untuk set fresh token
export const setFreshToken = () => {
  const freshToken = '88|rCx9DFH3WBC48qv4nngV8vLVGfgSmMt3nwADXERD85f778f8';
  
  console.log('🔄 Setting fresh token...');
  localStorage.setItem('auth_token', freshToken);
  
  console.log('✅ Fresh token set!');
  console.log('Token:', freshToken.substring(0, 20) + '...');
  
  return freshToken;
};

// Auto-set fresh token
export const autoSetFreshToken = () => {
  console.log('🚀 Auto-setting fresh token...');
  const token = setFreshToken();
  
  // Test the token
  return fetch('https://nurverse.id/api/danus/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => {
    console.log('📡 Test response:', response.status);
    if (response.ok) {
      console.log('✅ Fresh token is working!');
      return true;
    } else {
      console.log('❌ Fresh token test failed');
      return false;
    }
  })
  .catch(error => {
    console.error('❌ Test error:', error);
    return false;
  });
};
