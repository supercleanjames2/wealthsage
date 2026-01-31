import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import type { PortfolioBalance, MiningTransaction } from "@shared/schema";

export function PortfolioOverview() {
  const [timePeriod, setTimePeriod] = useState("30D");
  const { priceData } = useWebSocket();

  const { data: portfolio } = useQuery<PortfolioBalance[]>({
    queryKey: ["/api/portfolio"],
  });

  const { data: transactions } = useQuery<MiningTransaction[]>({
    queryKey: ["/api/transactions"],
  });

  const calculateValue = (balance: PortfolioBalance) => {
    if (balance.cryptocurrency === 'USD') return balance.amount;
    
    const price = balance.cryptocurrency === 'BTC' 
      ? priceData?.bitcoin.usd || 43287.50
      : priceData?.ethereum.usd || 2834.21;
    
    return balance.amount * price;
  };

  const portfolioItems = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      balance: portfolio?.find(b => b.cryptocurrency === 'BTC'),
      icon: "fab fa-bitcoin",
      iconBg: "bg-orange-500",
      change: "+5.2%"
    },
    {
      name: "Ethereum", 
      symbol: "ETH",
      balance: portfolio?.find(b => b.cryptocurrency === 'ETH'),
      icon: "fab fa-ethereum",
      iconBg: "bg-blue-500",
      change: "+2.8%"
    },
    {
      name: "Cash",
      symbol: "USD",
      balance: portfolio?.find(b => b.cryptocurrency === 'USD'),
      icon: "fas fa-dollar-sign",
      iconBg: "bg-green-500",
      change: "Stable"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mining_reward':
        return 'fas fa-arrow-down';
      case 'exchange_sale':
        return 'fas fa-arrow-up';
      default:
        return 'fas fa-exchange-alt';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'mining_reward':
        return 'text-green-500';
      case 'exchange_sale':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Less than 1 hour ago";
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6" data-testid="portfolio-overview">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" data-testid="portfolio-title">Portfolio Overview</h2>
        <div className="flex items-center space-x-2">
          {["7D", "30D", "90D"].map((period) => (
            <Button
              key={period}
              size="sm"
              variant={timePeriod === period ? "default" : "ghost"}
              onClick={() => setTimePeriod(period)}
              data-testid={`button-period-${period.toLowerCase()}`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <div key={item.symbol} className="bg-muted/30 rounded-lg p-4" data-testid={`portfolio-item-${item.symbol.toLowerCase()}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${item.iconBg} rounded-full flex items-center justify-center`}>
                  <i className={`${item.icon} text-white text-xs`}></i>
                </div>
                <span className="font-medium" data-testid={`portfolio-name-${item.symbol.toLowerCase()}`}>{item.name}</span>
              </div>
              <span className={`text-xs ${item.change === 'Stable' ? 'text-muted-foreground' : 'text-green-500'}`} data-testid={`portfolio-change-${item.symbol.toLowerCase()}`}>
                {item.change}
              </span>
            </div>
            <p className="text-lg font-bold" data-testid={`portfolio-amount-${item.symbol.toLowerCase()}`}>
              {item.balance ? 
                `${item.balance.amount.toFixed(item.symbol === 'USD' ? 2 : 4)} ${item.symbol}` : 
                `0.0000 ${item.symbol}`
              }
            </p>
            <p className="text-sm text-muted-foreground" data-testid={`portfolio-value-${item.symbol.toLowerCase()}`}>
              {item.balance ? 
                `≈ $${calculateValue(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 
                "≈ $0.00"
              }
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium" data-testid="transactions-title">Recent Transactions</h3>
          <Button variant="ghost" size="sm" data-testid="button-view-all-transactions">
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {transactions?.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2" data-testid={`transaction-${transaction.id}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getTransactionColor(transaction.type)}/20 rounded-lg flex items-center justify-center`}>
                  <i className={`${getTransactionIcon(transaction.type)} ${getTransactionColor(transaction.type)} text-xs`}></i>
                </div>
                <div>
                  <p className="text-sm font-medium" data-testid={`transaction-type-${transaction.id}`}>
                    {transaction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`transaction-time-${transaction.id}`}>
                    {formatTimeAgo(transaction.timestamp || new Date())}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-500" data-testid={`transaction-amount-${transaction.id}`}>
                  +{transaction.amount.toFixed(6)} {transaction.cryptocurrency}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`transaction-value-${transaction.id}`}>
                  ${transaction.usdValue.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-4 text-muted-foreground" data-testid="no-transactions">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
