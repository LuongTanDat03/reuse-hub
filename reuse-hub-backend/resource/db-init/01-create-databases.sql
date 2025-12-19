-- ============================================
-- CREATE ALL DATABASES AND EXTENSIONS
-- ============================================

-- Create databases
CREATE DATABASE identity;
CREATE DATABASE profile;
CREATE DATABASE item;
CREATE DATABASE transaction;
CREATE DATABASE payment;
CREATE DATABASE auction;
CREATE DATABASE moderation;

-- ============================================
-- IDENTITY DATABASE - SETUP
-- ============================================
\c identity;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types for identity
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'BANNED', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables for identity-service
CREATE TABLE IF NOT EXISTS tbl_role (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tbl_permission (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    resource VARCHAR(255),
    action VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_role_has_permission (
    id VARCHAR(255) PRIMARY KEY,
    role_id VARCHAR(255) REFERENCES tbl_role(id),
    permission_id VARCHAR(255) REFERENCES tbl_permission(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_user (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status user_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tbl_user_has_role (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES tbl_user(id),
    role_id VARCHAR(255) REFERENCES tbl_role(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for identity
CREATE INDEX IF NOT EXISTS idx_user_email ON tbl_user(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON tbl_user(username);
CREATE INDEX IF NOT EXISTS idx_user_phone ON tbl_user(phone);
CREATE INDEX IF NOT EXISTS idx_user_status ON tbl_user(status);

-- ============================================
-- PROFILE DATABASE - SETUP
-- ============================================
\c profile;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create ENUM types for profile
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

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('VIEW', 'LIKE', 'SAVE', 'SHARE', 'COMMENT', 'SEARCH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables for profile-service
CREATE TABLE IF NOT EXISTS tbl_users (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    gender gender,
    birthday DATE,
    phone VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    avatar_url TEXT,
    rating_average DOUBLE PRECISION DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    wallet BIGINT DEFAULT 0,
    kyc_status kyc_status DEFAULT 'NOT_SUBMITTED',
    location geometry(Point, 4326),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_address (
    id VARCHAR(255) PRIMARY KEY,
    address_id VARCHAR(255) UNIQUE,
    address_line TEXT,
    street VARCHAR(255),
    ward VARCHAR(255),
    district VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255) REFERENCES tbl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_user_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES tbl_users(id),
    action action_type,
    item_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_follow (
    id VARCHAR(255) PRIMARY KEY,
    follower_id VARCHAR(255) REFERENCES tbl_users(id),
    following_id VARCHAR(255) REFERENCES tbl_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS tbl_kyc_verifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_type document_type,
    document_number VARCHAR(255),
    full_name VARCHAR(255),
    date_of_birth DATE,
    front_image_url TEXT,
    back_image_url TEXT,
    selfie_image_url TEXT,
    status kyc_status DEFAULT 'PENDING',
    rejection_reason TEXT,
    verified_at TIMESTAMP,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for profile
CREATE INDEX IF NOT EXISTS idx_user_user_id ON tbl_users(user_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON tbl_users(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON tbl_users(phone);
CREATE INDEX IF NOT EXISTS idx_user_username ON tbl_users(username);
CREATE INDEX IF NOT EXISTS idx_address_city ON tbl_address(city);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON tbl_kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON tbl_kyc_verifications(status);

-- ============================================
-- ITEM DATABASE - SETUP
-- ============================================
\c item;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create ENUM types for item
DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN', 'DELETED', 'PENDING', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interaction_type AS ENUM ('VIEW', 'LIKE', 'SAVE', 'SHARE', 'COMMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables for item-service
CREATE TABLE IF NOT EXISTS tbl_category (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    images JSONB DEFAULT '[]',
    address TEXT,
    location geometry(Point, 4326),
    status item_status DEFAULT 'AVAILABLE',
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    price BIGINT DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    category_id VARCHAR(255) REFERENCES tbl_category(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_item_tags (
    item_id VARCHAR(255) REFERENCES tbl_items(id),
    tag_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tbl_item_interaction (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    interaction_type interaction_type,
    item_id VARCHAR(255) REFERENCES tbl_items(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_ratings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    rating DOUBLE PRECISION,
    item_id VARCHAR(255) REFERENCES tbl_items(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_item_comments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    comment TEXT,
    item_id VARCHAR(255) REFERENCES tbl_items(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for item
CREATE INDEX IF NOT EXISTS idx_items_user_id ON tbl_items(user_id);
CREATE INDEX IF NOT EXISTS idx_category_name ON tbl_category(name);

-- ============================================
-- TRANSACTION DATABASE - SETUP
-- ============================================
\c transaction;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types for transaction
DO $$ BEGIN 
    CREATE TYPE transaction_status AS ENUM (
        'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 
        'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 
        'REFUNDED', 'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('GIVE', 'SELL', 'EXCHANGE', 'AUCTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM ('PICKUP', 'SHIPPING', 'MEET_UP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables for transaction-service
CREATE TABLE IF NOT EXISTS tbl_transaction (
    id VARCHAR(255) PRIMARY KEY,
    item_id VARCHAR(255) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    item_image_url TEXT,
    item_price BIGINT NOT NULL,
    buyer_id VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255) NOT NULL,
    status transaction_status NOT NULL,
    type transaction_type NOT NULL,
    quantity INTEGER,
    total_amount BIGINT NOT NULL,
    delivery_method delivery_method NOT NULL,
    delivery_address TEXT,
    delivery_phone VARCHAR(255),
    delivery_notes TEXT,
    buyer_note TEXT,
    seller_note TEXT,
    delivery_tracking_code VARCHAR(255),
    buyer_feedback TEXT,
    cancelled_by VARCHAR(255),
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    reason TEXT,
    shipped_at TIMESTAMP,
    expires_at TIMESTAMP,
    feedback_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PAYMENT DATABASE - SETUP
-- ============================================
\c payment;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types for payment
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables for payment-service
CREATE TABLE IF NOT EXISTS tbl_payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    amount BIGINT,
    currency VARCHAR(10),
    status payment_status DEFAULT 'PENDING',
    stripe_payment_intent_id VARCHAR(255),
    description TEXT,
    linked_item_id VARCHAR(255),
    linked_transaction_id VARCHAR(255) UNIQUE,
    payment_method VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    payload TEXT,
    received_at TIMESTAMP NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for payment
CREATE INDEX IF NOT EXISTS idx_stripe_payment_intent_id ON tbl_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_linked_transaction_id ON tbl_payments(linked_transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_id_status ON tbl_payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON tbl_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_event_id ON tbl_webhook_events(stripe_event_id);

-- -- ============================================
-- -- AUCTION DATABASE - SETUP
-- -- ============================================
-- \c auction;

-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -- Create ENUM types for auction
-- DO $$ BEGIN
--     CREATE TYPE auction_status AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'CANCELLED', 'SOLD');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- DO $$ BEGIN
--     CREATE TYPE bid_status AS ENUM ('ACTIVE', 'OUTBID', 'WINNING', 'WON', 'LOST', 'CANCELLED');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- -- Create tables for auction-service
-- CREATE TABLE IF NOT EXISTS tbl_auctions (
--     id VARCHAR(255) PRIMARY KEY,
--     item_id VARCHAR(255),
--     seller_id VARCHAR(255) NOT NULL,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     images JSONB DEFAULT '[]',
--     starting_price BIGINT NOT NULL,
--     current_price BIGINT NOT NULL,
--     bid_increment BIGINT NOT NULL,
--     buy_now_price BIGINT,
--     reserve_price BIGINT,
--     start_time TIMESTAMP NOT NULL,
--     end_time TIMESTAMP NOT NULL,
--     status auction_status DEFAULT 'PENDING',
--     bid_count INTEGER DEFAULT 0,
--     winner_id VARCHAR(255),
--     winning_bid_id VARCHAR(255),
--     category_id VARCHAR(255),
--     address TEXT,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE IF NOT EXISTS tbl_bids (
--     id VARCHAR(255) PRIMARY KEY,
--     auction_id VARCHAR(255) NOT NULL REFERENCES tbl_auctions(id),
--     bidder_id VARCHAR(255) NOT NULL,
--     amount BIGINT NOT NULL,
--     max_auto_bid BIGINT,
--     status bid_status DEFAULT 'ACTIVE',
--     is_auto_bid BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

-- -- Create indexes for auction
-- CREATE INDEX IF NOT EXISTS idx_auction_seller ON tbl_auctions(seller_id);
-- CREATE INDEX IF NOT EXISTS idx_auction_item ON tbl_auctions(item_id);
-- CREATE INDEX IF NOT EXISTS idx_auction_status ON tbl_auctions(status);
-- CREATE INDEX IF NOT EXISTS idx_auction_end_time ON tbl_auctions(end_time);
-- CREATE INDEX IF NOT EXISTS idx_bid_auction ON tbl_bids(auction_id);
-- CREATE INDEX IF NOT EXISTS idx_bid_bidder ON tbl_bids(bidder_id);
-- CREATE INDEX IF NOT EXISTS idx_bid_amount ON tbl_bids(amount);

-- -- ============================================
-- -- MODERATION DATABASE - SETUP
-- -- ============================================
-- \c moderation;

-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -- Create ENUM types for moderation
-- DO $$ BEGIN
--     CREATE TYPE report_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- DO $$ BEGIN
--     CREATE TYPE reported_entity_type AS ENUM ('USER', 'ITEM', 'CHAT_MESSAGE', 'REVIEW', 'AUCTION');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- DO $$ BEGIN
--     CREATE TYPE report_type AS ENUM (
--         'SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FRAUD', 
--         'FAKE_ITEM', 'PROHIBITED_ITEM', 'COPYRIGHT', 'OTHER'
--     );
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- DO $$ BEGIN
--     CREATE TYPE moderation_action AS ENUM (
--         'WARNING', 'CONTENT_REMOVED', 'TEMPORARY_BAN', 
--         'PERMANENT_BAN', 'NO_ACTION', 'REFERRED_TO_LEGAL'
--     );
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- -- Create tables for moderation-service
-- CREATE TABLE IF NOT EXISTS tbl_reports (
--     id VARCHAR(255) PRIMARY KEY,
--     reporter_id VARCHAR(255) NOT NULL,
--     reported_user_id VARCHAR(255),
--     entity_type reported_entity_type NOT NULL,
--     entity_id VARCHAR(255) NOT NULL,
--     report_type report_type NOT NULL,
--     reason TEXT NOT NULL,
--     evidence_urls JSONB DEFAULT '[]',
--     status report_status DEFAULT 'PENDING',
--     reviewer_id VARCHAR(255),
--     reviewed_at TIMESTAMP,
--     action_taken moderation_action,
--     admin_note TEXT,
--     resolved_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT NOW(),
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

-- -- Create indexes for moderation
-- CREATE INDEX IF NOT EXISTS idx_report_reporter ON tbl_reports(reporter_id);
-- CREATE INDEX IF NOT EXISTS idx_report_reported_user ON tbl_reports(reported_user_id);
-- CREATE INDEX IF NOT EXISTS idx_report_status ON tbl_reports(status);
-- CREATE INDEX IF NOT EXISTS idx_report_entity ON tbl_reports(entity_type, entity_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'All databases, extensions, enum types, and tables created successfully!' AS status;
