import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setup() {
  console.log("Setting up Neon PostgreSQL database schema...");

  // 1. Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      nickname VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      email_verified TIMESTAMPTZ,
      image TEXT,
      avatar_card_id VARCHAR(50) DEFAULT 'cat-prince',
      role VARCHAR(50) DEFAULT 'GROOM',
      phone VARCHAR(50),
      bio TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_card_id VARCHAR(50) DEFAULT 'cat-prince';`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'GROOM';`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`;

  // 2. Weddings table
  await sql`
    CREATE TABLE IF NOT EXISTS weddings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL DEFAULT 'Pernikahan Kita',
      invite_code VARCHAR(30) UNIQUE NOT NULL,
      groom_name VARCHAR(255),
      bride_name VARCHAR(255),
      wedding_date VARCHAR(100),
      city VARCHAR(100),
      target_budget NUMERIC(15, 2) DEFAULT 0,
      current_savings NUMERIC(15, 2) DEFAULT 0,
      slug VARCHAR(100),
      venue_name VARCHAR(255),
      venue_address TEXT,
      mahar_details TEXT,
      wali_nikah VARCHAR(255),
      penghulu VARCHAR(255),
      saksi_nikah VARCHAR(255),
      is_partner_connected BOOLEAN DEFAULT FALSE,
      partner_name VARCHAR(255),
      partner_email VARCHAR(255),
      partner_role VARCHAR(50),
      partner_avatar_card_id VARCHAR(50),
      primary_user_email VARCHAR(255),
      partner_user_email VARCHAR(255),
      plan_data TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS invite_code VARCHAR(30);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS groom_name VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS bride_name VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wedding_date VARCHAR(100);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS target_budget NUMERIC(15, 2) DEFAULT 0;`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS current_savings NUMERIC(15, 2) DEFAULT 0;`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS slug VARCHAR(100);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS venue_address TEXT;`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS mahar_details TEXT;`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wali_nikah VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS penghulu VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS saksi_nikah VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS is_partner_connected BOOLEAN DEFAULT FALSE;`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS partner_name VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS partner_email VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS partner_role VARCHAR(50);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS partner_avatar_card_id VARCHAR(50);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS primary_user_email VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS partner_user_email VARCHAR(255);`;
  await sql`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS plan_data TEXT;`;

  // 3. Couple History table
  await sql`
    CREATE TABLE IF NOT EXISTS couple_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user1_email VARCHAR(255) NOT NULL,
      user2_email VARCHAR(255) NOT NULL,
      wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      unpaired_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log("Database schema successfully verified and updated in Neon!");
}

setup().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
