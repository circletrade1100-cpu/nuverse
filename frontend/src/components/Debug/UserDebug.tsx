import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';

const UserDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasModuleAccess, getAccessibleModules, hasPermission } = usePermission();

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-bold text-red-800">User Debug - Not Authenticated</h3>
        <p>User is not logged in</p>
      </div>
    );
  }

  const accessibleModules = getAccessibleModules();

  // Debug logs
  console.log('Debug - User:', user);
  console.log('Debug - User roles:', user?.roles);
  console.log('Debug - Accessible modules:', accessibleModules);

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h3 className="font-bold text-blue-800 mb-4">User Debug Information</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">User Info:</h4>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
        </div>

        <div>
          <h4 className="font-semibold">Roles:</h4>
          {user.roles && user.roles.length > 0 ? (
            <ul className="list-disc pl-5">
              {user.roles.map(role => (
                <li key={role.id}>
                  {role.display_name} ({role.name}) - ID: {role.id}
                  {role.permissions && (
                    <ul className="list-disc pl-5 mt-2">
                      <li>Permissions count: {role.permissions.length}</li>
                      {role.permissions.slice(0, 5).map(perm => (
                        <li key={perm.id} className="text-xs">
                          {perm.name} - {perm.display_name}
                        </li>
                      ))}
                      {role.permissions.length > 5 && (
                        <li className="text-xs text-gray-600">
                          ... and {role.permissions.length - 5} more
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-600">No roles found!</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold">Accessible Modules:</h4>
          <p className="text-xs text-gray-600 mb-2">
            From getAccessibleModules(): {JSON.stringify(accessibleModules)}
          </p>
          {user?.roles?.[0]?.permissions && (
            <p className="text-xs text-gray-600 mb-2">
              Sample permissions: {user.roles[0].permissions.slice(0, 3).map(p => p.name).join(', ')}
            </p>
          )}
          {accessibleModules.length > 0 ? (
            <ul className="list-disc pl-5">
              {accessibleModules.map(module => (
                <li key={module}>{module}</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-600">No accessible modules!</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold">Permission Tests:</h4>
          <ul className="list-disc pl-5">
            <li>tata-usaha.view: {hasPermission('tata-usaha', 'view') ? '✅' : '❌'}</li>
            <li>pemasukan.view: {hasPermission('pemasukan', 'view') ? '✅' : '❌'}</li>
            <li>pengeluaran.view: {hasPermission('pengeluaran', 'view') ? '✅' : '❌'}</li>
            <li>tata-usaha module access: {hasModuleAccess('tata-usaha') ? '✅' : '❌'}</li>
            <li>pemasukan module access: {hasModuleAccess('pemasukan') ? '✅' : '❌'}</li>
            <li>pengeluaran module access: {hasModuleAccess('pengeluaran') ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Raw User Data:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default UserDebug;
