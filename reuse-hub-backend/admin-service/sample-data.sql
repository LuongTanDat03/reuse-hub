-- Admin Service Sample Data (PostgreSQL)
-- Generated on 2024-12-04
-- This file contains permissions and role-permission mappings for the admin service

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM tbl_role_has_permission;
-- DELETE FROM tbl_permission;

-- Note: Roles and Users are managed by identity-service
-- This file only contains permissions and their mappings

-- Insert Permissions
INSERT INTO tbl_permission (id, name, description, resource, action, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
-- User Management Permissions
(gen_random_uuid(), 'user:create', 'Create new users', 'user', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'user:read', 'Read user information', 'user', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'user:update', 'Update user information', 'user', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'user:delete', 'Delete users', 'user', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'user:manage', 'Full user management', 'user', 'manage', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'user:ban', 'Ban/suspend users', 'user', 'ban', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'user:unban', 'Unban users', 'user', 'unban', NOW(), NOW(), 'system', 'system', false),

-- Profile Permissions
(gen_random_uuid(), 'profile:create', 'Create user profiles', 'profile', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'profile:read', 'Read user profiles', 'profile', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'profile:update', 'Update user profiles', 'profile', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'profile:delete', 'Delete user profiles', 'profile', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'profile:read:own', 'Read own profile', 'profile', 'read:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'profile:update:own', 'Update own profile', 'profile', 'update:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'profile:verify', 'Verify user profiles', 'profile', 'verify', NOW(), NOW(), 'system', 'system', false),

-- Item Permissions
(gen_random_uuid(), 'item:create', 'Create items', 'item', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:read', 'Read items', 'item', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:update', 'Update items', 'item', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:delete', 'Delete items', 'item', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:read:own', 'Read own items', 'item', 'read:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:update:own', 'Update own items', 'item', 'update:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:delete:own', 'Delete own items', 'item', 'delete:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:moderate', 'Moderate items', 'item', 'moderate', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:approve', 'Approve items', 'item', 'approve', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:reject', 'Reject items', 'item', 'reject', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'item:feature', 'Feature items (premium)', 'item', 'feature', NOW(), NOW(), 'system', 'system', false),

-- Category Permissions
(gen_random_uuid(), 'category:create', 'Create categories', 'category', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'category:read', 'Read categories', 'category', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'category:update', 'Update categories', 'category', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'category:delete', 'Delete categories', 'category', 'delete', NOW(), NOW(), 'system', 'system', false),

-- Transaction Permissions
(gen_random_uuid(), 'transaction:create', 'Create transactions', 'transaction', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'transaction:read', 'Read transactions', 'transaction', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'transaction:update', 'Update transactions', 'transaction', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'transaction:delete', 'Delete transactions', 'transaction', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'transaction:read:own', 'Read own transactions', 'transaction', 'read:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'transaction:cancel', 'Cancel transactions', 'transaction', 'cancel', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'transaction:refund', 'Refund transactions', 'transaction', 'refund', NOW(), NOW(), 'system', 'system', false),

-- Payment Permissions
(gen_random_uuid(), 'payment:create', 'Create payments', 'payment', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'payment:read', 'Read payments', 'payment', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'payment:update', 'Update payments', 'payment', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'payment:read:own', 'Read own payments', 'payment', 'read:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'payment:refund', 'Process refunds', 'payment', 'refund', NOW(), NOW(), 'system', 'system', false),

-- Chat Permissions
(gen_random_uuid(), 'chat:create', 'Create chat conversations', 'chat', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'chat:read', 'Read chat messages', 'chat', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'chat:update', 'Update chat messages', 'chat', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'chat:delete', 'Delete chat messages', 'chat', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'chat:read:own', 'Read own chats', 'chat', 'read:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'chat:moderate', 'Moderate chat content', 'chat', 'moderate', NOW(), NOW(), 'system', 'system', false),

-- Notification Permissions
(gen_random_uuid(), 'notification:create', 'Create notifications', 'notification', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'notification:read', 'Read notifications', 'notification', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'notification:read:own', 'Read own notifications', 'notification', 'read:own', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'notification:delete', 'Delete notifications', 'notification', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'notification:send', 'Send notifications', 'notification', 'send', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'notification:broadcast', 'Broadcast notifications', 'notification', 'broadcast', NOW(), NOW(), 'system', 'system', false),

-- Admin Dashboard Permissions
(gen_random_uuid(), 'admin:dashboard', 'Access admin dashboard', 'admin', 'dashboard', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'admin:users', 'Manage users in admin panel', 'admin', 'users', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'admin:content', 'Manage content in admin panel', 'admin', 'content', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'admin:system', 'Manage system settings', 'admin', 'system', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'admin:reports', 'Access admin reports', 'admin', 'reports', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'admin:analytics', 'View analytics', 'admin', 'analytics', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'admin:logs', 'View system logs', 'admin', 'logs', NOW(), NOW(), 'system', 'system', false),

-- Role Management Permissions
(gen_random_uuid(), 'role:create', 'Create roles', 'role', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'role:read', 'Read roles', 'role', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'role:update', 'Update roles', 'role', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'role:delete', 'Delete roles', 'role', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'role:assign', 'Assign roles to users', 'role', 'assign', NOW(), NOW(), 'system', 'system', false),

-- Permission Management
(gen_random_uuid(), 'permission:create', 'Create permissions', 'permission', 'create', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'permission:read', 'Read permissions', 'permission', 'read', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'permission:update', 'Update permissions', 'permission', 'update', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'permission:delete', 'Delete permissions', 'permission', 'delete', NOW(), NOW(), 'system', 'system', false),
(gen_random_uuid(), 'permission:assign', 'Assign permissions to roles', 'permission', 'assign', NOW(), NOW(), 'system', 'system', false);

-- Assign ALL permissions to ADMIN role
INSERT INTO tbl_role_has_permission (id, role_id, permission_id, created_at, updated_at, created_by, updated_by, is_deleted)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    NOW(),
    'system',
    'system',
    false
FROM tbl_role r
CROSS JOIN tbl_permission p
WHERE r.name = 'ADMIN';

-- Assign basic permissions to USER role
INSERT INTO tbl_role_has_permission (id, role_id, permission_id, created_at, updated_at, created_by, updated_by, is_deleted)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW(),
    NOW(),
    'system',
    'system',
    false
FROM tbl_role r
JOIN tbl_permission p ON p.name IN (
    -- Profile permissions
    'profile:read:own',
    'profile:update:own',
    
    -- Item permissions
    'item:create',
    'item:read',
    'item:read:own',
    'item:update:own',
    'item:delete:own',
    
    -- Category permissions (read only)
    'category:read',
    
    -- Transaction permissions
    'transaction:create',
    'transaction:read:own',
    'transaction:cancel',
    
    -- Payment permissions
    'payment:create',
    'payment:read:own',
    
    -- Chat permissions
    'chat:create',
    'chat:read:own',
    'chat:update',
    
    -- Notification permissions
    'notification:read:own',
    'notification:delete'
)
WHERE r.name = 'USER';

-- Verify data
SELECT 
    'Permissions' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT resource) as unique_resources,
    COUNT(DISTINCT action) as unique_actions
FROM tbl_permission
UNION ALL
SELECT 
    'Role-Permission Mappings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN r.name = 'ADMIN' THEN 1 END) as admin_permissions,
    COUNT(CASE WHEN r.name = 'USER' THEN 1 END) as user_permissions
FROM tbl_role_has_permission rhp
JOIN tbl_role r ON rhp.role_id = r.id;

-- Display permission summary by resource
SELECT 
    resource,
    COUNT(*) as permission_count,
    string_agg(action, ', ' ORDER BY action) as actions
FROM tbl_permission
GROUP BY resource
ORDER BY resource;
