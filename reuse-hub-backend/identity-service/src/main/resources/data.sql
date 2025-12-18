-- Identity Service Seed Data
-- Chạy sau khi tables được tạo bởi JPA

-- Enable extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tạo ENUM types nếu chưa có
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'BANNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1) Roles
INSERT INTO tbl_role (id, name, description, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'ADMIN', 'System Administrator', NOW(), NOW()),
(gen_random_uuid()::text, 'USER', 'Regular User', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2) Permissions
INSERT INTO tbl_permission (id, name, description, resource, action, created_at, updated_at) VALUES
-- User Management
(gen_random_uuid()::text, 'user:create', 'Create new users', 'user', 'create', NOW(), NOW()),
(gen_random_uuid()::text, 'user:read', 'Read user information', 'user', 'read', NOW(), NOW()),
(gen_random_uuid()::text, 'user:update', 'Update user information', 'user', 'update', NOW(), NOW()),
(gen_random_uuid()::text, 'user:delete', 'Delete users', 'user', 'delete', NOW(), NOW()),
(gen_random_uuid()::text, 'user:manage', 'Full user management', 'user', 'manage', NOW(), NOW()),
-- Profile
(gen_random_uuid()::text, 'profile:read:own', 'Read own profile', 'profile', 'read:own', NOW(), NOW()),
(gen_random_uuid()::text, 'profile:update:own', 'Update own profile', 'profile', 'update:own', NOW(), NOW()),
-- Item
(gen_random_uuid()::text, 'item:create', 'Create items', 'item', 'create', NOW(), NOW()),
(gen_random_uuid()::text, 'item:read', 'Read items', 'item', 'read', NOW(), NOW()),
(gen_random_uuid()::text, 'item:read:own', 'Read own items', 'item', 'read:own', NOW(), NOW()),
(gen_random_uuid()::text, 'item:update:own', 'Update own items', 'item', 'update:own', NOW(), NOW()),
(gen_random_uuid()::text, 'item:delete:own', 'Delete own items', 'item', 'delete:own', NOW(), NOW()),
-- Transaction
(gen_random_uuid()::text, 'transaction:create', 'Create transactions', 'transaction', 'create', NOW(), NOW()),
(gen_random_uuid()::text, 'transaction:read:own', 'Read own transactions', 'transaction', 'read:own', NOW(), NOW()),
-- Chat
(gen_random_uuid()::text, 'chat:create', 'Create chat conversations', 'chat', 'create', NOW(), NOW()),
(gen_random_uuid()::text, 'chat:read:own', 'Read own chats', 'chat', 'read:own', NOW(), NOW()),
-- Admin
(gen_random_uuid()::text, 'admin:dashboard', 'Access admin dashboard', 'admin', 'dashboard', NOW(), NOW()),
(gen_random_uuid()::text, 'admin:users', 'Manage users in admin panel', 'admin', 'users', NOW(), NOW()),
(gen_random_uuid()::text, 'admin:content', 'Manage content in admin panel', 'admin', 'content', NOW(), NOW()),
(gen_random_uuid()::text, 'admin:system', 'Manage system settings', 'admin', 'system', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3) ADMIN = tất cả permissions
INSERT INTO tbl_role_has_permission (id, role_id, permission_id, created_at, updated_at)
SELECT gen_random_uuid()::text, r.id, p.id, NOW(), NOW()
FROM tbl_role r
CROSS JOIN tbl_permission p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- 4) USER = các quyền cơ bản
INSERT INTO tbl_role_has_permission (id, role_id, permission_id, created_at, updated_at)
SELECT gen_random_uuid()::text, r.id, p.id, NOW(), NOW()
FROM tbl_role r
JOIN tbl_permission p ON p.name IN (
    'profile:read:own', 'profile:update:own',
    'item:create', 'item:read', 'item:read:own', 'item:update:own', 'item:delete:own',
    'transaction:create', 'transaction:read:own',
    'chat:create', 'chat:read:own'
)
WHERE r.name = 'USER'
ON CONFLICT DO NOTHING;

-- 5) Users (password: admin123 và user123)
-- BCrypt hash của 'admin123': $2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBjZe3/JQ/OA72.XKqGTjbZLya
-- BCrypt hash của 'user123': $2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK

INSERT INTO tbl_user (id, email, phone, username, password, status, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'admin@reusehub.com', '+84900000001', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBjZe3/JQ/OA72.XKqGTjbZLya', 'ACTIVE', NOW(), NOW()),
('7eff7e70-beb2-43d3-9bfc-08f2bcfbfdcf', 'user1@gmail.com', '+84900000002', 'user1', '$2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK', 'ACTIVE', NOW(), NOW()),
(gen_random_uuid()::text, 'user2@gmail.com', '+84900000003', 'user2', '$2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK', 'ACTIVE', NOW(), NOW()),
(gen_random_uuid()::text, 'user3@gmail.com', '+84900000004', 'user3', '$2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK', 'ACTIVE', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 6) User-Role mapping
INSERT INTO tbl_user_has_role (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid()::text, u.id, r.id, NOW(), NOW()
FROM tbl_user u
JOIN tbl_role r ON r.name = 'ADMIN'
WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO tbl_user_has_role (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid()::text, u.id, r.id, NOW(), NOW()
FROM tbl_user u
JOIN tbl_role r ON r.name = 'USER'
WHERE u.username IN ('user1', 'user2', 'user3')
ON CONFLICT DO NOTHING;