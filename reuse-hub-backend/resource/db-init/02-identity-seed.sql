-- ============================================
-- IDENTITY DATABASE - SEED DATA
-- ============================================
\c identity;

-- Enable extension để dùng gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Roles
INSERT INTO tbl_role (id, name, description, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'ADMIN', 'Administrator role with full access', NOW(), NOW(), 'system', 'system', false),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'USER', 'Regular user role', NOW(), NOW(), 'system', 'system', false);

-- 2) Permissions
INSERT INTO tbl_permission (id, name, description, resource, action, created_at, updated_at) VALUES
-- User Management
(gen_random_uuid(), 'user:create',        'Create new users',               'user',         'create',    NOW(), NOW()),
(gen_random_uuid(), 'user:read',          'Read user information',          'user',         'read',      NOW(), NOW()),
(gen_random_uuid(), 'user:update',        'Update user information',        'user',         'update',    NOW(), NOW()),
(gen_random_uuid(), 'user:delete',        'Delete users',                   'user',         'delete',    NOW(), NOW()),
(gen_random_uuid(), 'user:manage',        'Full user management',           'user',         'manage',    NOW(), NOW()),

-- Profile
(gen_random_uuid(), 'profile:create',     'Create user profiles',           'profile',      'create',    NOW(), NOW()),
(gen_random_uuid(), 'profile:read',       'Read user profiles',             'profile',      'read',      NOW(), NOW()),
(gen_random_uuid(), 'profile:update',     'Update user profiles',           'profile',      'update',    NOW(), NOW()),
(gen_random_uuid(), 'profile:delete',     'Delete user profiles',           'profile',      'delete',    NOW(), NOW()),
(gen_random_uuid(), 'profile:read:own',   'Read own profile',               'profile',      'read:own',  NOW(), NOW()),
(gen_random_uuid(), 'profile:update:own', 'Update own profile',             'profile',      'update:own',NOW(), NOW()),

-- Item
(gen_random_uuid(), 'item:create',        'Create items',                   'item',         'create',    NOW(), NOW()),
(gen_random_uuid(), 'item:read',          'Read items',                     'item',         'read',      NOW(), NOW()),
(gen_random_uuid(), 'item:update',        'Update items',                   'item',         'update',    NOW(), NOW()),
(gen_random_uuid(), 'item:delete',        'Delete items',                   'item',         'delete',    NOW(), NOW()),
(gen_random_uuid(), 'item:read:own',      'Read own items',                 'item',         'read:own',  NOW(), NOW()),
(gen_random_uuid(), 'item:update:own',    'Update own items',               'item',         'update:own',NOW(), NOW()),
(gen_random_uuid(), 'item:delete:own',    'Delete own items',               'item',         'delete:own',NOW(), NOW()),
(gen_random_uuid(), 'item:moderate',      'Moderate items',                 'item',         'moderate',  NOW(), NOW()),

-- Transaction
(gen_random_uuid(), 'transaction:create', 'Create transactions',            'transaction',  'create',    NOW(), NOW()),
(gen_random_uuid(), 'transaction:read',   'Read transactions',              'transaction',  'read',      NOW(), NOW()),
(gen_random_uuid(), 'transaction:update', 'Update transactions',            'transaction',  'update',    NOW(), NOW()),
(gen_random_uuid(), 'transaction:delete', 'Delete transactions',            'transaction',  'delete',    NOW(), NOW()),
(gen_random_uuid(), 'transaction:read:own','Read own transactions',         'transaction',  'read:own',  NOW(), NOW()),

-- Chat
(gen_random_uuid(), 'chat:create',        'Create chat conversations',      'chat',         'create',    NOW(), NOW()),
(gen_random_uuid(), 'chat:read',          'Read chat messages',             'chat',         'read',      NOW(), NOW()),
(gen_random_uuid(), 'chat:update',        'Update chat messages',           'chat',         'update',    NOW(), NOW()),
(gen_random_uuid(), 'chat:delete',        'Delete chat messages',           'chat',         'delete',    NOW(), NOW()),
(gen_random_uuid(), 'chat:read:own',      'Read own chats',                 'chat',         'read:own',  NOW(), NOW()),
(gen_random_uuid(), 'chat:moderate',      'Moderate chat content',          'chat',         'moderate',  NOW(), NOW()),

-- Admin
(gen_random_uuid(), 'admin:dashboard',    'Access admin dashboard',         'admin',        'dashboard', NOW(), NOW()),
(gen_random_uuid(), 'admin:users',        'Manage users in admin panel',    'admin',        'users',     NOW(), NOW()),
(gen_random_uuid(), 'admin:content',      'Manage content in admin panel',  'admin',        'content',   NOW(), NOW()),
(gen_random_uuid(), 'admin:system',       'Manage system settings',         'admin',        'system',    NOW(), NOW()),
(gen_random_uuid(), 'admin:reports',      'Access admin reports',           'admin',        'reports',   NOW(), NOW());

-- 3) ADMIN = tất cả permissions
INSERT INTO tbl_role_has_permission (id, role_id, permission_id, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, NOW(), NOW()
FROM tbl_role r
CROSS JOIN tbl_permission p
WHERE r.name = 'ADMIN';

-- 4) USER = các quyền cơ bản
INSERT INTO tbl_role_has_permission (id, role_id, permission_id, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, NOW(), NOW()
FROM tbl_role r
JOIN tbl_permission p ON p.name IN (
  'profile:read:own', 'profile:update:own',
  'item:create', 'item:read', 'item:read:own', 'item:update:own', 'item:delete:own',
  'transaction:create', 'transaction:read:own',
  'chat:create', 'chat:read:own'
)
WHERE r.name = 'USER';

-- 5) Tạo admin mặc định và gán role ADMIN
-- Password: admin123 (BCrypt encoded)
INSERT INTO tbl_user (id, email, phone, username, password, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@reusehub.com',
  '+84987654321',
  'admin',
  '$2a$10$mDSW1.GbBlSZs9KoCT/SzeqYhqAQEHvD0Py4dh4JofLCEONNR44ia',
  'ACTIVE',
  NOW(), NOW()
);

INSERT INTO tbl_user (id, email, phone, status, username, password, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'nguyen.van.a@gmail.com', '0912345678', 'ACTIVE', 'nguyenvana', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'tran.thi.b@gmail.com', '0923456789', 'ACTIVE', 'tranthib', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'le.van.c@gmail.com', '0934567890', 'ACTIVE', 'levanc', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'pham.thi.d@gmail.com', '0945678901', 'ACTIVE', 'phamthid', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'hoang.van.e@gmail.com', '0956789012', 'ACTIVE', 'hoangvane', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false);

INSERT INTO tbl_user_has_role (id, user_id, role_id, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false);

INSERT INTO tbl_user_has_role (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM tbl_user u
JOIN tbl_role r ON r.name = 'ADMIN'
WHERE u.username = 'admin';
