import {
  pgTable,
  text,
  varchar,
  timestamp,
  numeric,
  boolean,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Users Table (NextAuth & App Compatible)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 100 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  avatarCardId: varchar("avatar_card_id", { length: 50 }).default("cat-prince"),
  role: varchar("role", { length: 50 }).default("GROOM"),
  phone: varchar("phone", { length: 50 }),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_users_lower_email").on(sql`lower(${table.email})`),
]);

// 2. Shared Wedding Project Workspace
export const weddings = pgTable("weddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull().default("Pernikahan Kita"),
  inviteCode: varchar("invite_code", { length: 30 }).unique().notNull(),
  groomName: varchar("groom_name", { length: 255 }),
  brideName: varchar("bride_name", { length: 255 }),
  weddingDate: varchar("wedding_date", { length: 100 }),
  city: varchar("city", { length: 100 }),
  targetBudget: numeric("target_budget", { precision: 15, scale: 2 }).default("0"),
  currentSavings: numeric("current_savings", { precision: 15, scale: 2 }).default("0"),
  slug: varchar("slug", { length: 100 }),
  venueName: varchar("venue_name", { length: 255 }),
  venueAddress: text("venue_address"),
  maharDetails: text("mahar_details"),
  waliNikah: varchar("wali_nikah", { length: 255 }),
  penghulu: varchar("penghulu", { length: 255 }),
  saksiNikah: varchar("saksi_nikah", { length: 255 }),
  isPartnerConnected: boolean("is_partner_connected").default(false),
  partnerName: varchar("partner_name", { length: 255 }),
  partnerEmail: varchar("partner_email", { length: 255 }),
  partnerRole: varchar("partner_role", { length: 50 }),
  partnerAvatarCardId: varchar("partner_avatar_card_id", { length: 50 }),
  primaryUserEmail: varchar("primary_user_email", { length: 255 }),
  partnerUserEmail: varchar("partner_user_email", { length: 255 }),
  planData: text("plan_data"), // Complete serialized JSON state for all planning modules
  version: integer("version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_weddings_lower_primary").on(sql`lower(${table.primaryUserEmail})`),
  index("idx_weddings_lower_partner_user").on(sql`lower(${table.partnerUserEmail})`),
  index("idx_weddings_lower_partner").on(sql`lower(${table.partnerEmail})`),
  index("idx_weddings_lower_slug").on(sql`lower(${table.slug})`),
  index("idx_weddings_upper_invite_code").on(sql`upper(${table.inviteCode})`),
]);

// 3. Couple Pairing History (Tracks couple pairing & preserved workspace data upon reconnection)
export const coupleHistory = pgTable("couple_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  user1Email: varchar("user1_email", { length: 255 }).notNull(),
  user2Email: varchar("user2_email", { length: 255 }).notNull(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"), // 'ACTIVE' | 'UNPAIRED'
  unpairedAt: timestamp("unpaired_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_couple_history_lower_users").on(sql`lower(${table.user1Email})`, sql`lower(${table.user2Email})`, table.status),
]);

// 4. Wedding Members (Suami, Istri, Kolaborator)
export const weddingMembers = pgTable("wedding_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(), // 'GROOM' | 'BRIDE' | 'COLLABORATOR'
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
});

// 5. Partner Pairing Invitations
export const coupleInvitations = pgTable("couple_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  inviterUserId: uuid("inviter_user_id").notNull().references(() => users.id),
  inviteCode: varchar("invite_code", { length: 30 }).unique().notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
});
