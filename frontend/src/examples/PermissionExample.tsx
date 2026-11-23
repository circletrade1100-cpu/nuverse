import React from 'react';
import PermissionGate from '../components/common/PermissionGate';
import { usePermission } from '../hooks/usePermission';

/**
 * Example component showing how to use permission system
 */
const PermissionExample: React.FC = () => {
  const { user, hasPermission, hasModuleAccess, getAccessibleModules, isSuperAdmin } = usePermission();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Permission System Example</h2>
      
      {/* User Info */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Current User</h3>
        <p><strong>Name:</strong> {user?.name || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Is Super Admin:</strong> {isSuperAdmin() ? 'Yes' : 'No'}</p>
        <p><strong>Roles:</strong> {user?.roles?.map(r => r.display_name).join(', ') || 'None'}</p>
      </div>

      {/* Accessible Modules */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Accessible Modules</h3>
        <div className="flex flex-wrap gap-2">
          {getAccessibleModules().map(module => (
            <span key={module} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {module}
            </span>
          ))}
        </div>
      </div>

      {/* Permission Gates Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Permission Gate Examples</h3>
        
        {/* Payroll Module Access */}
        <PermissionGate module="payroll" fallback={<div className="text-red-500">No access to Payroll module</div>}>
          <div className="p-3 bg-green-100 text-green-800 rounded">
            ✓ You have access to Payroll module
          </div>
        </PermissionGate>

        {/* Create Permission */}
        <PermissionGate module="payroll" action="create" fallback={<div className="text-orange-500">Cannot create in Payroll module</div>}>
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            ✓ You can create records in Payroll module
          </div>
        </PermissionGate>

        {/* Delete Permission */}
        <PermissionGate module="payroll" action="delete" fallback={<div className="text-red-500">Cannot delete in Payroll module</div>}>
          <div className="p-3 bg-purple-100 text-purple-800 rounded">
            ✓ You can delete records in Payroll module
          </div>
        </PermissionGate>

        {/* Master Data Access */}
        <PermissionGate module="master-data" fallback={<div className="text-red-500">No access to Master Data module</div>}>
          <div className="p-3 bg-indigo-100 text-indigo-800 rounded">
            ✓ You have access to Master Data module
          </div>
        </PermissionGate>

        {/* User Management Access */}
        <PermissionGate module="user" fallback={<div className="text-red-500">No access to User Management module</div>}>
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
            ✓ You have access to User Management module
          </div>
        </PermissionGate>
      </div>

      {/* Permission Check Results */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Permission Checks</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Module Access:</strong>
            <ul className="mt-1 space-y-1">
              <li>Payroll: {hasModuleAccess('payroll') ? '✓' : '✗'}</li>
              <li>Master Data: {hasModuleAccess('master-data') ? '✓' : '✗'}</li>
              <li>User: {hasModuleAccess('user') ? '✓' : '✗'}</li>
              <li>Student: {hasModuleAccess('student') ? '✓' : '✗'}</li>
            </ul>
          </div>
          <div>
            <strong>Specific Permissions:</strong>
            <ul className="mt-1 space-y-1">
              <li>Payroll Create: {hasPermission('payroll', 'create') ? '✓' : '✗'}</li>
              <li>Payroll Delete: {hasPermission('payroll', 'delete') ? '✓' : '✗'}</li>
              <li>User Create: {hasPermission('user', 'create') ? '✓' : '✗'}</li>
              <li>Master Data Edit: {hasPermission('master-data', 'edit') ? '✓' : '✗'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionExample;
