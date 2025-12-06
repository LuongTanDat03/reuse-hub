-- Identity Service Sample Data
-- Generated on 2024-12-04

-- Insert Roles
INSERT INTO tbl_role (id, name, description, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'ADMIN', 'Administrator role with full access', NOW(), NOW(), 'system', 'system', false),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'USER', 'Regular user role', NOW(), NOW(), 'system', 'system', false);

-- Insert Users (password is 'password123' hashed with BCrypt)
INSERT INTO tbl_user (id, email, phone, status, username, password, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
-- Admin user
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'admin@reusehub.com', '0901234567', 'ACTIVE', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
-- Regular users
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'nguyen.van.a@gmail.com', '0912345678', 'ACTIVE', 'nguyenvana', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'tran.thi.b@gmail.com', '0923456789', 'ACTIVE', 'tranthib', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'le.van.c@gmail.com', '0934567890', 'ACTIVE', 'levanc', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'pham.thi.d@gmail.com', '0945678901', 'ACTIVE', 'phamthid', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'hoang.van.e@gmail.com', '0956789012', 'ACTIVE', 'hoangvane', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), 'system', 'system', false);

-- Assign roles to users
INSERT INTO tbl_user_has_role (id, user_id, role_id, created_at, updated_at, created_by, updated_by, is_deleted) VALUES
-- Admin role
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', NOW(), NOW(), 'system', 'system', false),
-- User roles
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false),
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', NOW(), NOW(), 'system', 'system', false);
