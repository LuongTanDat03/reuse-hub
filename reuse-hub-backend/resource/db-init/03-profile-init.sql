-- ============================================
-- PROFILE DATABASE - INITIALIZATION
-- ============================================
\c profile;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tạo ENUM types
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert users (mapping từ identity database)
-- Password: password123 (BCrypt encoded)
INSERT INTO tbl_users (
    id, user_id, first_name, last_name, gender, birthday, phone, email, 
    avatar_url, rating_average, rating_count, wallet, username, password, 
    kyc_status, created_at, updated_at
) VALUES
-- Nguyen Van A
(
    gen_random_uuid(),
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    'Văn A',
    'Nguyễn',
    'MALE',
    '1995-03-15',
    '0912345678',
    'nguyen.van.a@gmail.com',
    'https://i.pravatar.cc/150?u=nguyenvana',
    4.5,
    12,
    500000,
    'nguyenvana',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'VERIFIED',
    NOW(),
    NOW()
),
-- Tran Thi B
(
    gen_random_uuid(),
    'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    'Thị B',
    'Trần',
    'FEMALE',
    '1998-07-22',
    '0923456789',
    'tran.thi.b@gmail.com',
    'https://i.pravatar.cc/150?u=tranthib',
    4.8,
    25,
    1200000,
    'tranthib',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'VERIFIED',
    NOW(),
    NOW()
),
-- Le Van C
(
    gen_random_uuid(),
    'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    'Văn C',
    'Lê',
    'MALE',
    '1992-11-08',
    '0934567890',
    'le.van.c@gmail.com',
    'https://i.pravatar.cc/150?u=levanc',
    4.2,
    8,
    300000,
    'levanc',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'PENDING',
    NOW(),
    NOW()
),
-- Pham Thi D
(
    gen_random_uuid(),
    'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
    'Thị D',
    'Phạm',
    'FEMALE',
    '2000-01-30',
    '0945678901',
    'pham.thi.d@gmail.com',
    'https://i.pravatar.cc/150?u=phamthid',
    4.9,
    45,
    2500000,
    'phamthid',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'VERIFIED',
    NOW(),
    NOW()
),
-- Hoang Van E
(
    gen_random_uuid(),
    'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
    'Văn E',
    'Hoàng',
    'MALE',
    '1997-05-18',
    '0956789012',
    'hoang.van.e@gmail.com',
    'https://i.pravatar.cc/150?u=hoangvane',
    3.8,
    5,
    150000,
    'hoangvane',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'NOT_SUBMITTED',
    NOW(),
    NOW()
);

-- Insert addresses cho users
INSERT INTO tbl_address (
    id, user_id, street, ward, district, city, country, is_default, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    '123 Nguyễn Huệ',
    'Phường Bến Nghé',
    'Quận 1',
    'TP. Hồ Chí Minh',
    'Việt Nam',
    true,
    NOW(),
    NOW()
FROM tbl_users u WHERE u.user_id = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';

INSERT INTO tbl_address (
    id, user_id, street, ward, district, city, country, is_default, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    '456 Lê Lợi',
    'Phường Bến Thành',
    'Quận 1',
    'TP. Hồ Chí Minh',
    'Việt Nam',
    true,
    NOW(),
    NOW()
FROM tbl_users u WHERE u.user_id = 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b';

INSERT INTO tbl_address (
    id, user_id, street, ward, district, city, country, is_default, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    '789 Trần Hưng Đạo',
    'Phường 1',
    'Quận 5',
    'TP. Hồ Chí Minh',
    'Việt Nam',
    true,
    NOW(),
    NOW()
FROM tbl_users u WHERE u.user_id = 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c';

INSERT INTO tbl_address (
    id, user_id, street, ward, district, city, country, is_default, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    '321 Võ Văn Tần',
    'Phường 5',
    'Quận 3',
    'TP. Hồ Chí Minh',
    'Việt Nam',
    true,
    NOW(),
    NOW()
FROM tbl_users u WHERE u.user_id = 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d';

INSERT INTO tbl_address (
    id, user_id, street, ward, district, city, country, is_default, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    '654 Điện Biên Phủ',
    'Phường 15',
    'Quận Bình Thạnh',
    'TP. Hồ Chí Minh',
    'Việt Nam',
    true,
    NOW(),
    NOW()
FROM tbl_users u WHERE u.user_id = 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e';