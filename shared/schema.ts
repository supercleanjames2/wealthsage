import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const miningRigs = pgTable("mining_rigs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  cryptocurrency: text("cryptocurrency").notNull(),
  hashRate: real("hash_rate").notNull(),
  hashRateUnit: text("hash_rate_unit").notNull(),
  powerConsumption: integer("power_consumption").notNull(),
  isActive: boolean("is_active").default(true),
  dailyEarnings: real("daily_earnings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioBalances = pgTable("portfolio_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptocurrency: text("cryptocurrency").notNull(),
  amount: real("amount").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const miningTransactions = pgTable("mining_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  rigId: varchar("rig_id"),
  type: text("type").notNull(),
  cryptocurrency: text("cryptocurrency").notNull(),
  amount: real("amount").notNull(),
  usdValue: real("usd_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const exchangeConnections = pgTable("exchange_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  exchange: text("exchange").notNull(),
  isConnected: boolean("is_connected").default(false),
  apiKeyId: text("api_key_id"),
  settings: jsonb("settings"),
  lastSync: timestamp("last_sync"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  network: text("network").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull(),
  toAddress: text("to_address").notNull(),
  fromAddress: text("from_address"),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"),
  purpose: text("purpose"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertMiningRigSchema = createInsertSchema(miningRigs).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  hashRate: z.number().positive(),
  powerConsumption: z.number().positive(),
});

export const insertPortfolioBalanceSchema = createInsertSchema(portfolioBalances).omit({
  id: true,
  userId: true,
  lastUpdated: true,
});

export const insertMiningTransactionSchema = createInsertSchema(miningTransactions).omit({
  id: true,
  userId: true,
  timestamp: true,
});

export const insertExchangeConnectionSchema = createInsertSchema(exchangeConnections).omit({
  id: true,
  userId: true,
  lastSync: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  userId: true,
  timestamp: true,
}).extend({
  amount: z.number().positive(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMiningRig = z.infer<typeof insertMiningRigSchema>;
export type MiningRig = typeof miningRigs.$inferSelect;
export type InsertPortfolioBalance = z.infer<typeof insertPortfolioBalanceSchema>;
export type PortfolioBalance = typeof portfolioBalances.$inferSelect;
export type InsertMiningTransaction = z.infer<typeof insertMiningTransactionSchema>;
export type MiningTransaction = typeof miningTransactions.$inferSelect;
export type InsertExchangeConnection = z.infer<typeof insertExchangeConnectionSchema>;
export type ExchangeConnection = typeof exchangeConnections.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export interface WebSocketMessage {
  type: 'price_update' | 'mining_update' | 'portfolio_update';
  data: any;
}

export interface PriceData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
}

export interface MiningStatsData {
  totalHashRate: number;
  activeMinerCount: number;
  totalDailyEarnings: number;
  totalPowerConsumption: number;
}
