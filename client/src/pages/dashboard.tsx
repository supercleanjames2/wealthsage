import { Sidebar } from "@/components/sidebar";
import { StatsGrid } from "@/components/stats-grid";
import { PriceTracker } from "@/components/price-tracker";
import { ExchangeStatus } from "@/components/exchange-status";
import { MiningOperations } from "@/components/mining-operations";
import { ProfitabilityCalculator } from "@/components/profitability-calculator";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { CryptoPayments } from "@/components/crypto-payments";
import { useWebSocket } from "@/hooks/use-websocket";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { isConnected } = useWebSocket();
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen" data-testid="dashboard">
      <Sidebar />
      
      <main className="flex-1 p-6 overflow-auto" data-testid="main-content">
        {/* Header */}
        <header className="flex items-center justify-between mb-8" data-testid="header">
          <div>
            <h1 className="text-3xl font-bold" data-testid="page-title">Mining Dashboard</h1>
            <p className="text-muted-foreground mt-1" data-testid="page-subtitle">
              Monitor your cloud mining operations in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-card border border-border rounded-lg px-3 py-2" data-testid="mining-status">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 mining-active' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Mining Active' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2" data-testid="user-info">
              <img 
                className="w-8 h-8 rounded-full" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" 
                alt="User avatar"
              />
              <span className="text-sm font-medium" data-testid="user-name">John Miner</span>
              <i className="fas fa-chevron-down text-xs text-muted-foreground"></i>
            </div>
          </div>
        </header>

        {/* Conditional Content Based on Route */}
        {location === "/payments" ? (
          <CryptoPayments />
        ) : (
          <>
            <StatsGrid />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <PriceTracker />
              <ExchangeStatus />
            </div>

            {/* Mining Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MiningOperations />
              <ProfitabilityCalculator />
            </div>

            <PortfolioOverview />
          </>
        )}
      </main>
    </div>
  );
}
