// Utility untuk test API
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { tuService } from '../services/tuService';

export const testApiConnection = async () => {
  try {
    console.log('🔄 Testing API connection...');
    
    // Test 1: Login
    console.log('📋 Test 1: Login...');
    const user = await authService.login({
      email: 'admin@sekolah-annur.id',
      password: 'admin123'
    });
    console.log('✅ Login berhasil:', user);

    // Test 2: Get current user
    console.log('📋 Test 2: Get current user...');
    const currentUser = await authService.getCurrentUser();
    console.log('✅ Current user:', currentUser);

    // Test 3: Get users
    console.log('📋 Test 3: Get users...');
    const users = await userService.getUsers();
    console.log('✅ Users:', users);

    // Test 4: Get TU dashboard
    console.log('📋 Test 4: Get TU dashboard...');
    const dashboard = await tuService.getDashboard();
    console.log('✅ TU Dashboard:', dashboard);

    console.log('🎉 Semua test API berhasil!');
    return true;
  } catch (error) {
    console.error('❌ API Test gagal:', error);
    return false;
  }
};

// Function untuk test individual endpoints
export const testLogin = async () => {
  try {
    const result = await authService.login({
      email: 'admin@sekolah-annur.id', 
      password: 'admin123'
    });
    console.log('Login berhasil:', result);
    return result;
  } catch (error) {
    console.error('Login gagal:', error);
    throw error;
  }
};

export const testGetUsers = async () => {
  try {
    const result = await userService.getUsers({}, 1, 10);
    console.log('Get users berhasil:', result);
    return result;
  } catch (error) {
    console.error('Get users gagal:', error);
    throw error;
  }
};

export const testTUDashboard = async () => {
  try {
    const result = await tuService.getDashboard();
    console.log('TU Dashboard berhasil:', result);
    return result;
  } catch (error) {
    console.error('TU Dashboard gagal:', error);
    throw error;
  }
};
