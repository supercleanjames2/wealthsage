import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getAuthenticatedUser, createOrUpdateRepo, getUncachableGitHubClient } from "./github";
import { 
  insertMiningRigSchema,
  insertPortfolioBalanceSchema,
  insertMiningTransactionSchema,
  insertExchangeConnectionSchema,
  insertPaymentSchema,
  type WebSocketMessage,
  type PriceData,
  type MiningStatsData
} from "@shared/schema";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  let priceData: PriceData = {
    bitcoin: { usd: 43287.50, usd_24h_change: 2.45 },
    ethereum: { usd: 2834.21, usd_24h_change: -1.23 }
  };

  function broadcast(message: WebSocketMessage) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  async function updatePrices() {
    try {
      const response = await fetch(
        `${COINGECKO_API_URL}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        priceData = {
          bitcoin: { 
            usd: data.bitcoin.usd, 
            usd_24h_change: data.bitcoin.usd_24hr_change || 0 
          },
          ethereum: { 
            usd: data.ethereum.usd, 
            usd_24h_change: data.ethereum.usd_24hr_change || 0 
          }
        };

        broadcast({
          type: 'price_update',
          data: priceData
        });
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
  }

  async function updateMiningStats(userId: string) {
    try {
      const rigs = await storage.getMiningRigs(userId);
      
      const stats: MiningStatsData = {
        totalHashRate: rigs.reduce((sum, rig) => sum + (rig.isActive ? rig.hashRate : 0), 0),
        activeMinerCount: rigs.filter(rig => rig.isActive).length,
        totalDailyEarnings: rigs.reduce((sum, rig) => sum + (rig.isActive ? rig.dailyEarnings || 0 : 0), 0),
        totalPowerConsumption: rigs.reduce((sum, rig) => sum + (rig.isActive ? rig.powerConsumption : 0), 0)
      };

      for (const rig of rigs.filter(r => r.isActive)) {
        const randomReward = Math.random() * 0.001;
        const usdValue = randomReward * (rig.cryptocurrency === 'BTC' ? priceData.bitcoin.usd : priceData.ethereum.usd);
        
        if (Math.random() > 0.7) {
          await storage.createMiningTransaction(userId, {
            rigId: rig.id,
            type: "mining_reward",
            cryptocurrency: rig.cryptocurrency,
            amount: randomReward,
            usdValue: usdValue
          });

          const currentBalance = await storage.getPortfolioBalance(userId, rig.cryptocurrency);
          if (currentBalance) {
            await storage.updatePortfolioBalance(userId, {
              cryptocurrency: rig.cryptocurrency,
              amount: currentBalance.amount + randomReward
            });
          }
        }
      }

      broadcast({
        type: 'mining_update',
        data: stats
      });

    } catch (error) {
      console.error('Failed to update mining stats:', error);
    }
  }

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.send(JSON.stringify({
      type: 'price_update',
      data: priceData
    }));

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  updatePrices();
  setInterval(updatePrices, 30000);
  setInterval(() => updateMiningStats("default-user"), 60000);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/prices", async (req, res) => {
    res.json(priceData);
  });

  app.get("/api/mining-rigs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rigs = await storage.getMiningRigs(userId);
      res.json(rigs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mining rigs" });
    }
  });

  app.post("/api/mining-rigs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rigData = insertMiningRigSchema.parse(req.body);
      const rig = await storage.createMiningRig(userId, rigData);
      res.json(rig);
    } catch (error) {
      res.status(400).json({ error: "Invalid mining rig data" });
    }
  });

  app.patch("/api/mining-rigs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const rig = await storage.updateMiningRig(id, updates);
      
      if (!rig) {
        return res.status(404).json({ error: "Mining rig not found" });
      }
      
      res.json(rig);
    } catch (error) {
      res.status(400).json({ error: "Failed to update mining rig" });
    }
  });

  app.delete("/api/mining-rigs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMiningRig(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Mining rig not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mining rig" });
    }
  });

  app.get("/api/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const balances = await storage.getPortfolioBalances(userId);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getMiningTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/exchanges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getExchangeConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exchange connections" });
    }
  });

  app.post("/api/exchanges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connectionData = insertExchangeConnectionSchema.parse(req.body);
      const connection = await storage.createOrUpdateExchangeConnection(userId, connectionData);
      res.json(connection);
    } catch (error) {
      res.status(400).json({ error: "Invalid exchange connection data" });
    }
  });

  app.post("/api/calculate-profitability", async (req, res) => {
    try {
      const { cryptocurrency, hashRate, hashRateUnit, powerConsumption, electricityCost } = req.body;
      
      if (!cryptocurrency || !hashRate || !powerConsumption || !electricityCost) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const price = cryptocurrency === 'BTC' ? priceData.bitcoin.usd : priceData.ethereum.usd;
      
      const baseRevenuePerTH = cryptocurrency === 'BTC' ? 0.000015 : 0.00005;
      let normalizedHashRate = hashRate;
      
      if (hashRateUnit === 'GH/s' && cryptocurrency === 'BTC') {
        normalizedHashRate = hashRate / 1000;
      } else if (hashRateUnit === 'MH/s' && cryptocurrency === 'BTC') {
        normalizedHashRate = hashRate / 1000000;
      } else if (hashRateUnit === 'TH/s' && cryptocurrency === 'ETH') {
        normalizedHashRate = hashRate * 1000;
      }

      const dailyCryptoReward = normalizedHashRate * baseRevenuePerTH;
      const dailyRevenue = dailyCryptoReward * price;
      const dailyPowerCostKwh = (powerConsumption * 24) / 1000;
      const dailyCosts = dailyPowerCostKwh * electricityCost;
      const dailyProfit = dailyRevenue - dailyCosts;

      res.json({
        revenue: dailyRevenue,
        costs: dailyCosts,
        profit: dailyProfit,
        cryptoAmount: dailyCryptoReward
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate profitability" });
    }
  });

  app.get("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const payments = await storage.getPayments(userId, limit);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const FIXED_PAYMENT_ADDRESS = "0xE5A9CBDde1be6d164d32922d66B36d2f1E91d939";
      
      const validatedData = insertPaymentSchema.parse(req.body);
      
      const paymentData = {
        ...validatedData,
        toAddress: FIXED_PAYMENT_ADDRESS
      };
      
      const payment = await storage.createPayment(userId, paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  app.patch("/api/payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, transactionHash } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const validStatuses = ["pending", "confirmed", "failed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be pending, confirmed, or failed" });
      }
      
      const payment = await storage.updatePaymentStatus(id, status, transactionHash);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // GitHub Integration Routes
  app.get("/api/github/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getAuthenticatedUser();
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get GitHub user" });
    }
  });

  app.post("/api/github/sync", isAuthenticated, async (req: any, res) => {
    try {
      const { repoName, isPrivate = false } = req.body;
      
      if (!repoName) {
        return res.status(400).json({ error: "Repository name is required" });
      }

      const result = await createOrUpdateRepo(repoName, isPrivate);
      res.json({
        success: true,
        repo: result.repo,
        created: result.created,
        message: result.created ? `Repository '${repoName}' created successfully` : `Repository '${repoName}' already exists`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to sync with GitHub" });
    }
  });

  return httpServer;
}
