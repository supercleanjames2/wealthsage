import { 
  type User, 
  type UpsertUser,
  type MiningRig,
  type InsertMiningRig,
  type PortfolioBalance,
  type InsertPortfolioBalance,
  type MiningTransaction,
  type InsertMiningTransaction,
  type ExchangeConnection,
  type InsertExchangeConnection,
  type Payment,
  type InsertPayment,
  users,
  miningRigs,
  portfolioBalances,
  miningTransactions,
  exchangeConnections,
  payments
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  getMiningRigs(userId: string): Promise<MiningRig[]>;
  getMiningRig(id: string): Promise<MiningRig | undefined>;
  createMiningRig(userId: string, rig: InsertMiningRig): Promise<MiningRig>;
  updateMiningRig(id: string, updates: Partial<MiningRig>): Promise<MiningRig | undefined>;
  deleteMiningRig(id: string): Promise<boolean>;

  getPortfolioBalances(userId: string): Promise<PortfolioBalance[]>;
  getPortfolioBalance(userId: string, cryptocurrency: string): Promise<PortfolioBalance | undefined>;
  updatePortfolioBalance(userId: string, balance: InsertPortfolioBalance): Promise<PortfolioBalance>;

  getMiningTransactions(userId: string, limit?: number): Promise<MiningTransaction[]>;
  createMiningTransaction(userId: string, transaction: InsertMiningTransaction): Promise<MiningTransaction>;

  getExchangeConnections(userId: string): Promise<ExchangeConnection[]>;
  getExchangeConnection(userId: string, exchange: string): Promise<ExchangeConnection | undefined>;
  createOrUpdateExchangeConnection(userId: string, connection: InsertExchangeConnection): Promise<ExchangeConnection>;

  getPayments(userId: string, limit?: number): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(userId: string, payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string, transactionHash?: string): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getMiningRigs(userId: string): Promise<MiningRig[]> {
    return await db.select().from(miningRigs).where(eq(miningRigs.userId, userId));
  }

  async getMiningRig(id: string): Promise<MiningRig | undefined> {
    const [rig] = await db.select().from(miningRigs).where(eq(miningRigs.id, id));
    return rig;
  }

  async createMiningRig(userId: string, rigData: InsertMiningRig): Promise<MiningRig> {
    const id = randomUUID();
    const [rig] = await db.insert(miningRigs).values({
      id,
      userId,
      ...rigData,
      dailyEarnings: 0,
      isActive: rigData.isActive ?? true,
    }).returning();
    return rig;
  }

  async updateMiningRig(id: string, updates: Partial<MiningRig>): Promise<MiningRig | undefined> {
    const [rig] = await db.update(miningRigs)
      .set(updates)
      .where(eq(miningRigs.id, id))
      .returning();
    return rig;
  }

  async deleteMiningRig(id: string): Promise<boolean> {
    const result = await db.delete(miningRigs).where(eq(miningRigs.id, id)).returning();
    return result.length > 0;
  }

  async getPortfolioBalances(userId: string): Promise<PortfolioBalance[]> {
    return await db.select().from(portfolioBalances).where(eq(portfolioBalances.userId, userId));
  }

  async getPortfolioBalance(userId: string, cryptocurrency: string): Promise<PortfolioBalance | undefined> {
    const [balance] = await db.select().from(portfolioBalances)
      .where(and(eq(portfolioBalances.userId, userId), eq(portfolioBalances.cryptocurrency, cryptocurrency)));
    return balance;
  }

  async updatePortfolioBalance(userId: string, balanceData: InsertPortfolioBalance): Promise<PortfolioBalance> {
    const existing = await this.getPortfolioBalance(userId, balanceData.cryptocurrency);
    
    if (existing) {
      const [updated] = await db.update(portfolioBalances)
        .set({ ...balanceData, lastUpdated: new Date() })
        .where(eq(portfolioBalances.id, existing.id))
        .returning();
      return updated;
    } else {
      const id = randomUUID();
      const [balance] = await db.insert(portfolioBalances).values({
        id,
        userId,
        ...balanceData,
      }).returning();
      return balance;
    }
  }

  async getMiningTransactions(userId: string, limit: number = 10): Promise<MiningTransaction[]> {
    return await db.select().from(miningTransactions)
      .where(eq(miningTransactions.userId, userId))
      .orderBy(desc(miningTransactions.timestamp))
      .limit(limit);
  }

  async createMiningTransaction(userId: string, transactionData: InsertMiningTransaction): Promise<MiningTransaction> {
    const id = randomUUID();
    const [transaction] = await db.insert(miningTransactions).values({
      id,
      userId,
      ...transactionData,
    }).returning();
    return transaction;
  }

  async getExchangeConnections(userId: string): Promise<ExchangeConnection[]> {
    return await db.select().from(exchangeConnections).where(eq(exchangeConnections.userId, userId));
  }

  async getExchangeConnection(userId: string, exchange: string): Promise<ExchangeConnection | undefined> {
    const [connection] = await db.select().from(exchangeConnections)
      .where(and(eq(exchangeConnections.userId, userId), eq(exchangeConnections.exchange, exchange)));
    return connection;
  }

  async createOrUpdateExchangeConnection(userId: string, connectionData: InsertExchangeConnection): Promise<ExchangeConnection> {
    const existing = await this.getExchangeConnection(userId, connectionData.exchange);
    
    if (existing) {
      const [updated] = await db.update(exchangeConnections)
        .set({ ...connectionData, lastSync: new Date() })
        .where(eq(exchangeConnections.id, existing.id))
        .returning();
      return updated;
    } else {
      const id = randomUUID();
      const [connection] = await db.insert(exchangeConnections).values({
        id,
        userId,
        ...connectionData,
        isConnected: connectionData.isConnected ?? false,
      }).returning();
      return connection;
    }
  }

  async getPayments(userId: string, limit: number = 10): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.timestamp))
      .limit(limit);
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(userId: string, paymentData: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const [payment] = await db.insert(payments).values({
      id,
      userId,
      ...paymentData,
      status: paymentData.status || "pending",
    }).returning();
    return payment;
  }

  async updatePaymentStatus(id: string, status: string, transactionHash?: string): Promise<Payment | undefined> {
    const [payment] = await db.update(payments)
      .set({ 
        status,
        ...(transactionHash && { transactionHash })
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
