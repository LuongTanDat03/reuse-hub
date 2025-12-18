-- Profile Service Seed Data
-- Chạy sau khi tables được tạo bởi JPA

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tạo ENUM types nếu chưa có
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Profile (liên kết với identity-service users qua user_id từ tbl_user.id)
-- Cần lấy user_id từ identity database

-- Tạo temporary table để lưu user_id mapping
DO $$
DECLARE
    v_admin_id TEXT := gen_random_uuid()::text;
    v_user1_id TEXT := gen_random_uuid()::text;
    v_user2_id TEXT := gen_random_uuid()::text;
    v_user3_id TEXT := gen_random_uuid()::text;
    v_profile_admin_id TEXT := gen_random_uuid()::text;
    v_profile1_id TEXT := gen_random_uuid()::text;
    v_profile2_id TEXT := gen_random_uuid()::text;
    v_profile3_id TEXT := gen_random_uuid()::text;
BEGIN
    -- Insert Users Profile
    INSERT INTO tbl_users (id, user_id, first_name, last_name, gender, birthday, phone, email, avatar_url, rating_average, rating_count, location, wallet, username, password, kyc_status, created_at, updated_at) VALUES
    -- Admin
    (v_profile_admin_id, v_admin_id, 'Admin', 'System', 'MALE', '1990-01-01', '+84900000001', 'admin@reusehub.com', 
     'https://ui-avatars.com/api/?name=Admin+System&background=random', 5.0, 10, 
     ST_SetSRID(ST_MakePoint(106.6297, 10.8231), 4326), 1000000, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBuBjZe3/JQ/OA72.XKqGTjbZLya', 'APPROVED', NOW(), NOW()),
    -- User 1 - Nguyễn Văn A (HCM)
    (v_profile1_id, v_user1_id, 'Văn A', 'Nguyễn', 'MALE', '1995-05-15', '+84900000002', 'user1@gmail.com',
     'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random', 4.5, 20,
     ST_SetSRID(ST_MakePoint(106.6602, 10.7626), 4326), 500000, 'user1', '$2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK', 'APPROVED', NOW(), NOW()),
    -- User 2 - Trần Thị B (HCM)
    (v_profile2_id, v_user2_id, 'Thị B', 'Trần', 'FEMALE', '1998-08-20', '+84900000003', 'user2@gmail.com',
     'https://ui-avatars.com/api/?name=Tran+Thi+B&background=random', 4.8, 15,
     ST_SetSRID(ST_MakePoint(106.6880, 10.7769), 4326), 300000, 'user2', '$2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK', 'APPROVED', NOW(), NOW()),
    -- User 3 - Lê Văn C (HCM)
    (v_profile3_id, v_user3_id, 'Văn C', 'Lê', 'MALE', '1992-12-10', '+84900000004', 'user3@gmail.com',
     'https://ui-avatars.com/api/?name=Le+Van+C&background=random', 4.2, 8,
     ST_SetSRID(ST_MakePoint(106.6503, 10.8012), 4326), 200000, 'user3', '$2a$10$EqKcp1WFKVQISheBxkguKuIAzFrOLCLJXPx/G5WPlfNYPJwGXpOHK', 'APPROVED', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Insert Addresses
    INSERT INTO tbl_address (id, user_id, street, ward, district, city, country, is_default, created_at, updated_at) VALUES
    -- Admin addresses
    (gen_random_uuid()::text, v_profile_admin_id, '123 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'Việt Nam', true, NOW(), NOW()),
    -- User 1 addresses
    (gen_random_uuid()::text, v_profile1_id, '456 Lê Lợi', 'Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 'Việt Nam', true, NOW(), NOW()),
    (gen_random_uuid()::text, v_profile1_id, '789 Điện Biên Phủ', 'Phường 15', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'Việt Nam', false, NOW(), NOW()),
    -- User 2 addresses
    (gen_random_uuid()::text, v_profile2_id, '321 Võ Văn Tần', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'Việt Nam', true, NOW(), NOW()),
    -- User 3 addresses
    (gen_random_uuid()::text, v_profile3_id, '654 Cách Mạng Tháng 8', 'Phường 10', 'Quận 10', 'TP. Hồ Chí Minh', 'Việt Nam', true, NOW(), NOW())
    ON CONFLICT DO NOTHING;
END $$;