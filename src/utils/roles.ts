export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER'
};

// Simple permission mapping if needed in future
export const PERMISSIONS = {
    // Admin permissions
    MANAGE_USERS: 'manage_users',
    VIEW_ANALYTICS: 'view_analytics',

    // User permissions
    VIEW_PROFILE: 'view_profile',
    UPDATE_PROFILE: 'update_profile'
};

export const ROLE_PERMISSIONS = {
    [Role.ADMIN]: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.UPDATE_PROFILE
    ],
    [Role.USER]: [
        PERMISSIONS.VIEW_PROFILE,
        PERMISSIONS.UPDATE_PROFILE
    ]
};
