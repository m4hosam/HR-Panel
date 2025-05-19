/**
 * User role constants for authorization
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = keyof typeof ROLES;

/**
 * Role-based permissions map
 * This defines what actions each role is allowed to perform
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    users: ['create', 'read', 'update', 'delete'],
    employees: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    salaries: ['create', 'read', 'update', 'delete'],
  },
  [ROLES.MANAGER]: {
    users: ['read'],
    employees: ['read'],
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    salaries: ['read', 'update'],
  },
  [ROLES.EMPLOYEE]: {
    users: [],
    employees: ['read'],
    projects: ['read'],
    tasks: ['read', 'update'],
    salaries: ['read'],
  },
} as const;

/**
 * Check if a user with a specific role has permission to perform an action
 * @param role User role
 * @param resource Resource type (e.g., 'users', 'projects')
 * @param action Action to perform (e.g., 'read', 'update')
 * @returns Boolean indicating if the role has permission
 */
export function hasPermission(
  role: Role,
  resource: keyof (typeof ROLE_PERMISSIONS)[Role], 
  action: string
): boolean {
  return ROLE_PERMISSIONS[role][resource].includes(action as never);
}
