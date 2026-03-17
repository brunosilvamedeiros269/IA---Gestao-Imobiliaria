import { Database } from './supabase/database.types'

export type UserRole = Database['public']['Enums']['user_role']

export const ROLE_LEVELS: Record<UserRole, number> = {
    admin: 100,
    manager: 50,
    broker: 10,
}

export type Permission = 
    | 'view_finance' 
    | 'manage_settings' 
    | 'manage_team' 
    | 'view_all_leads' 
    | 'view_all_properties'
    | 'manage_inventory'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    admin: [
        'view_finance',
        'manage_settings',
        'manage_team',
        'view_all_leads',
        'view_all_properties',
        'manage_inventory'
    ],
    manager: [
        'manage_team',
        'view_all_leads',
        'view_all_properties',
        'manage_inventory'
    ],
    broker: [
        // Brokers only see their own via RLS, but need access to the pages
    ]
}

/**
 * Verifica se um papel tem uma permissão específica
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
    if (!role) return false
    return (ROLE_PERMISSIONS[role] || []).includes(permission)
}

/**
 * Compara dois papéis para verificar hierarquia
 */
export function isHigherOrEqual(role: UserRole, targetRole: UserRole): boolean {
    return ROLE_LEVELS[role] >= ROLE_LEVELS[targetRole]
}

/**
 * Verifica se o usuário é administrativo (Admin ou Gerente)
 */
export function isStaff(role: UserRole | undefined): boolean {
    return role === 'admin' || role === 'manager'
}
