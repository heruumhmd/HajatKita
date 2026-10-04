import {
  pgTable,
  text,
  varchar,
  timestamp,
  numeric,
  boolean,
  integer,
  uuid,
  date,
} from "drizzle-orm/pg-core";

// 1. Users Table (NextAuth Compatible)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 2. Shared Wedding Project Workspace
export const weddings = pgTable("weddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull().default("Pernikahan Kita"),
  weddingDate: date("wedding_date"),
  city: varchar("city", { length: 100 }),
  totalTargetBudget: numeric("total_target_budget", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 3. Wedding Members (Suami, Istri, Kolaborator)
export const weddingMembers = pgTable("wedding_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(), // 'GROOM' | 'BRIDE' | 'COLLABORATOR'
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
});

// 4. Partner Pairing Invitations
export const coupleInvitations = pgTable("couple_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  inviterUserId: uuid("inviter_user_id").notNull().references(() => users.id),
  inviteCode: varchar("invite_code", { length: 10 }).unique().notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
});

// 5. Saving Goals & Logs (Diagram Lingkaran Tabungan)
export const savingGoals = pgTable("saving_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  targetAmount: numeric("target_amount", { precision: 15, scale: 2 }).notNull(),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const savingLogs = pgTable("saving_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  savingGoalId: uuid("saving_goal_id").notNull().references(() => savingGoals.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  contributorLabel: varchar("contributor_label", { length: 50 }).notNull(), // 'Calon Suami', 'Calon Istri', 'Orang Tua'
  note: text("note"),
  depositedAt: date("deposited_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 6. Checklist & Timeline Tasks
export const checklistTasks = pgTable("checklist_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  timelineTag: varchar("timeline_tag", { length: 50 }).notNull(), // 'H-12 Bulan', 'H-6 Bulan', 'H-3 Bulan', etc.
  status: varchar("status", { length: 20 }).notNull().default("TODO"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  documentAttachmentUrl: text("document_attachment_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 7. Seserahan & Hantaran
export const seserahanItems = pgTable("seserahan_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  boxNumber: integer("box_number").notNull().default(1),
  boxName: varchar("box_name", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  category: varchar("category", { length: 100 }),
  estimatedPrice: numeric("estimated_price", { precision: 15, scale: 2 }).default("0"),
  actualPrice: numeric("actual_price", { precision: 15, scale: 2 }),
  purchaseUrl: text("purchase_url"),
  isPurchased: boolean("is_purchased").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 8. Post-Wedding Household Wishlist (Barang Pasca-Nikah)
export const postWeddingItems = pgTable("post_wedding_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  roomCategory: varchar("room_category", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  price: numeric("price", { precision: 15, scale: 2 }).default("0"),
  purchaseUrl: text("purchase_url"),
  priority: varchar("priority", { length: 50 }).default("MUST_HAVE"),
  isAcquired: boolean("is_acquired").default(false),
  isGiftClaimable: boolean("is_gift_claimable").default(true),
  claimedBy: varchar("claimed_by", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 9. Guests & Social Debts
export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  side: varchar("side", { length: 20 }).default("BOTH"),
  category: varchar("category", { length: 50 }).default("Keluarga"),
  pax: integer("pax").default(1),
  rsvpStatus: varchar("rsvp_status", { length: 50 }).default("PENDING"),
  envelopeAmount: numeric("envelope_amount", { precision: 15, scale: 2 }),
  giftDescription: text("gift_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 10. Activity Logs for Couples
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
