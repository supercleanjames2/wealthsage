import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import type { PortfolioBalance } from "@shared/schema";

export function StatsGrid() {
  const { miningStats } = useWebSocket();
  
  const { data: portfolio } = useQuery<PortfolioBalance[]>({
    queryKey: ["/api/portfolio"],
  });

  const totalEarnings = portfolio?.reduce((sum, balance) => {
    if (balance.cryptocurrency === 'USD') return sum + balance.amount;
    // For crypto, we'd multiply by current price - simplified here
    return sum + (balance.amount * 1000); // Placeholder calculation
  }, 0) || 2847.32;

  const stats = [
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: "+12.5% this week",
      changeType: "positive" as const,
      icon: "fas fa-dollar-sign",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500"
    },
    {
      title: "Active Miners",
      value: miningStats?.activeMinerCount?.toString() || "8",
      change: "2 ETH, 6 BTC miners",
      changeType: "neutral" as const,
      icon: "fas fa-microchip",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "Daily Revenue",
      value: `$${miningStats?.totalDailyEarnings?.toFixed(2) || "127.45"}`,
      change: "-3.2% today",
      changeType: "negative" as const,
      icon: "fas fa-chart-line",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500"
    },
    {
      title: "Hash Rate",
      value: `${miningStats?.totalHashRate?.toFixed(1) || "2.4"} TH/s`,
      change: "Optimal performance",
      changeType: "positive" as const,
      icon: "fas fa-tachometer-alt",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6" data-testid={`stat-card-${index}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground" data-testid={`stat-title-${index}`}>{stat.title}</p>
              <p className={`text-2xl font-bold ${
                stat.changeType === 'positive' ? 'text-green-500' : 
                stat.changeType === 'negative' ? '' : ''
              }`} data-testid={`stat-value-${index}`}>
                {stat.value}
              </p>
              <p className={`text-xs mt-1 ${
                stat.changeType === 'positive' ? 'text-green-500' :
                stat.changeType === 'negative' ? 'text-orange-500' :
                'text-muted-foreground'
              }`} data-testid={`stat-change-${index}`}>
                {stat.changeType === 'positive' && <i className="fas fa-arrow-up"></i>}
                {stat.changeType === 'negative' && <i className="fas fa-arrow-down"></i>}
                {stat.change && ` ${stat.change}`}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} ${stat.iconColor} text-lg`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
