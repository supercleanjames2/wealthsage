import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { ExchangeConnection } from "@shared/schema";

export function ExchangeStatus() {
  const { data: exchanges } = useQuery<ExchangeConnection[]>({
    queryKey: ["/api/exchanges"],
  });

  const updateExchangeMutation = useMutation({
    mutationFn: async (data: { exchange: string; settings: any }) => {
      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update exchange");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
    },
  });

  const handleToggleAutoSell = (exchange: string, crypto: string, enabled: boolean) => {
    const connection = exchanges?.find(e => e.exchange === exchange);
    if (!connection) return;

    const newSettings = {
      ...(connection.settings as Record<string, any> || {}),
      [`autoSell${crypto}`]: enabled
    };

    updateExchangeMutation.mutate({
      exchange,
      settings: newSettings
    });
  };

  const exchangeList = [
    {
      id: "coinbase",
      name: "Coinbase",
      shortName: "CB",
      color: "bg-blue-600",
      isConnected: true
    },
    {
      id: "binance",
      name: "Binance",
      shortName: "BN",
      color: "bg-yellow-500",
      isConnected: true
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6" data-testid="exchange-status">
      <h2 className="text-xl font-semibold mb-6" data-testid="exchange-status-title">Exchange Connections</h2>
      
      <div className="space-y-4">
        {exchangeList.map((exchange) => {
          const connection = exchanges?.find(e => e.exchange === exchange.id);
          
          return (
            <div key={exchange.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`exchange-${exchange.id}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${exchange.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{exchange.shortName}</span>
                </div>
                <div>
                  <p className="font-medium" data-testid={`exchange-name-${exchange.id}`}>{exchange.name}</p>
                  <p className="text-xs text-muted-foreground" data-testid={`exchange-status-${exchange.id}`}>
                    {connection?.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connection?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${connection?.isConnected ? 'text-green-500' : 'text-red-500'}`} data-testid={`exchange-connection-${exchange.id}`}>
                  {connection?.isConnected ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          );
        })}
        
        <Button className="w-full mt-4" variant="outline" data-testid="button-add-exchange">
          <i className="fas fa-plus mr-2"></i>
          Add Exchange
        </Button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="font-medium mb-3" data-testid="auto-trading-title">Auto-trading Settings</h3>
        <div className="space-y-3">
          {['ETH', 'BTC'].map((crypto) => {
            const ethConnection = exchanges?.find(e => e.exchange === 'coinbase');
            const isEnabled = (ethConnection?.settings as Record<string, any>)?.[`autoSell${crypto}`] || false;
            
            return (
              <div key={crypto} className="flex items-center justify-between" data-testid={`auto-sell-${crypto.toLowerCase()}`}>
                <span className="text-sm text-muted-foreground">Auto-sell {crypto}</span>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggleAutoSell('coinbase', crypto, checked)}
                  data-testid={`switch-auto-sell-${crypto.toLowerCase()}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
