import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import type { PriceData } from "@shared/schema";

export function PriceTracker() {
  const { priceData, isConnected } = useWebSocket();
  
  // Fallback query in case WebSocket fails
  const { data: fallbackPrices } = useQuery<PriceData>({
    queryKey: ["/api/prices"],
    refetchInterval: 30000,
  });

  const prices = priceData || fallbackPrices;

  if (!prices) {
    return (
      <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4 h-24"></div>
            <div className="bg-muted/30 rounded-lg p-4 h-24"></div>
          </div>
          <div className="h-48 bg-muted/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const cryptos = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: prices.bitcoin.usd,
      change: prices.bitcoin.usd_24h_change,
      icon: "fab fa-bitcoin",
      iconBg: "bg-orange-500"
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: prices.ethereum.usd,
      change: prices.ethereum.usd_24h_change,
      icon: "fab fa-ethereum",
      iconBg: "bg-blue-500"
    }
  ];

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6" data-testid="price-tracker">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" data-testid="price-tracker-title">Real-time Prices</h2>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span data-testid="connection-status">{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {cryptos.map((crypto) => (
          <div key={crypto.symbol} className="bg-muted/30 rounded-lg p-4" data-testid={`price-card-${crypto.symbol.toLowerCase()}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 ${crypto.iconBg} rounded-full flex items-center justify-center`}>
                  <i className={`${crypto.icon} text-white text-sm`}></i>
                </div>
                <span className="font-medium" data-testid={`crypto-name-${crypto.symbol.toLowerCase()}`}>{crypto.name}</span>
                <span className="text-xs text-muted-foreground" data-testid={`crypto-symbol-${crypto.symbol.toLowerCase()}`}>{crypto.symbol}</span>
              </div>
              <span className={`text-sm ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid={`crypto-change-${crypto.symbol.toLowerCase()}`}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
              </span>
            </div>
            <p className="text-2xl font-bold" data-testid={`crypto-price-${crypto.symbol.toLowerCase()}`}>
              ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
      
      {/* Simplified chart placeholder - replace with actual chart library */}
      <div className="relative h-48 bg-muted/10 rounded-lg overflow-hidden" data-testid="price-chart">
        <div className="absolute inset-0 chart-container"></div>
        <div className="relative h-full flex items-end justify-between px-4 pb-4">
          {/* Simulated chart bars */}
          {[30, 45, 60, 40, 70, 55, 85, 90].map((height, index) => (
            <div
              key={index}
              className={`w-2 bg-primary/${20 + index * 10} rounded-t`}
              style={{ height: `${height}%` }}
              data-testid={`chart-bar-${index}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
