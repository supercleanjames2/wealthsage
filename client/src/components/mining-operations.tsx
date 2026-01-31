import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MiningRig } from "@shared/schema";

export function MiningOperations() {
  const { data: rigs, isLoading } = useQuery<MiningRig[]>({
    queryKey: ["/api/mining-rigs"],
  });

  const toggleRigMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/mining-rigs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update mining rig");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mining-rigs"] });
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCryptoIcon = (crypto: string) => {
    return crypto === 'BTC' ? 'fab fa-bitcoin' : 'fab fa-ethereum';
  };

  const getCryptoColor = (crypto: string) => {
    return crypto === 'BTC' ? 'bg-orange-500' : 'bg-blue-500';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6" data-testid="mining-operations">
      <h2 className="text-xl font-semibold mb-6" data-testid="mining-operations-title">Mining Operations</h2>
      
      <div className="space-y-4">
        {rigs?.map((rig) => (
          <div key={rig.id} className="bg-muted/30 rounded-lg p-4" data-testid={`mining-rig-${rig.id}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getCryptoColor(rig.cryptocurrency)} rounded-lg flex items-center justify-center`}>
                  <i className={`${getCryptoIcon(rig.cryptocurrency)} text-white text-xs`}></i>
                </div>
                <div>
                  <p className="font-medium" data-testid={`rig-name-${rig.id}`}>{rig.name}</p>
                  <p className="text-xs text-muted-foreground" data-testid={`rig-model-${rig.id}`}>{rig.model}</p>
                </div>
              </div>
              <Badge 
                variant={rig.isActive ? "default" : "secondary"}
                className={rig.isActive ? "bg-green-500/20 text-green-500" : ""}
                data-testid={`rig-status-${rig.id}`}
              >
                {rig.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <p className="text-muted-foreground">Hash Rate</p>
                <p className="font-medium" data-testid={`rig-hashrate-${rig.id}`}>
                  {rig.hashRate} {rig.hashRateUnit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Power</p>
                <p className="font-medium" data-testid={`rig-power-${rig.id}`}>{rig.powerConsumption}W</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h Earnings</p>
                <p className="font-medium text-green-500" data-testid={`rig-earnings-${rig.id}`}>
                  ${rig.dailyEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={rig.isActive ? "destructive" : "default"}
                onClick={() => toggleRigMutation.mutate({ id: rig.id, isActive: !rig.isActive })}
                disabled={toggleRigMutation.isPending}
                data-testid={`button-toggle-rig-${rig.id}`}
              >
                {rig.isActive ? "Stop" : "Start"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                data-testid={`button-settings-rig-${rig.id}`}
              >
                Settings
              </Button>
            </div>
          </div>
        ))}
        
        <Button 
          className="w-full mt-4" 
          variant="outline"
          data-testid="button-add-mining-rig"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Mining Rig
        </Button>
      </div>
    </div>
  );
}
