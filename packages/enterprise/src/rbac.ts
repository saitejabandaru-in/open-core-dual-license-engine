/**
 * Enterprise Role-Based Access Control (RBAC) Module
 */

export type Role = 'admin' | 'manager' | 'analyst' | 'viewer';
export type Permission = 'read:all' | 'write:all' | 'delete:all' | 'manage:users' | 'export:audit_logs' | 'configure:sso';

export class EnterpriseRBAC {
  private rolePermissions: Record<Role, Permission[]> = {
    admin: ['read:all', 'write:all', 'delete:all', 'manage:users', 'export:audit_logs', 'configure:sso'],
    manager: ['read:all', 'write:all', 'export:audit_logs'],
    analyst: ['read:all', 'export:audit_logs'],
    viewer: ['read:all'],
  };

  constructor() {
    console.log('[Enterprise RBAC] Access Control Matrix Initialized.');
  }

  public hasPermission(role: Role, permission: Permission): boolean {
    const permissions = this.rolePermissions[role] || [];
    return permissions.includes(permission);
  }

  public enforcePermission(role: Role, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(`[RBAC Access Denied] Role '${role}' lacks required permission '${permission}'.`);
    }
  }
}
