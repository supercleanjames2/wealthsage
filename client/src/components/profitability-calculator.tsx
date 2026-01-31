import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfitabilityResult {
  revenue: number;
  costs: number;
  profit: number;
  cryptoAmount: number;
}

export function ProfitabilityCalculator() {
  const [cryptocurrency, setCryptocurrency] = useState("BTC");
  const [hashRate, setHashRate] = useState("");
  const [hashRateUnit, setHashRateUnit] = useState("TH/s");
  const [powerConsumption, setPowerConsumption] = useState("");
  const [electricityCost, setElectricityCost] = useState("0.12");
  const [result, setResult] = useState<ProfitabilityResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/calculate-profitability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cryptocurrency,
          hashRate: parseFloat(hashRate),
          hashRateUnit,
          powerConsumption: parseFloat(powerConsumption),
          electricityCost: parseFloat(electricityCost),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to calculate profitability");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleCalculate = () => {
    if (!hashRate || !powerConsumption || !electricityCost) {
      return;
    }
    calculateMutation.mutate();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6" data-testid="profitability-calculator">
      <h2 className="text-xl font-semibold mb-6" data-testid="calculator-title">Profitability Calculator</h2>
      
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium mb-2">Cryptocurrency</Label>
          <Select value={cryptocurrency} onValueChange={setCryptocurrency} data-testid="select-cryptocurrency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Hash Rate</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="100"
              value={hashRate}
              onChange={(e) => setHashRate(e.target.value)}
              className="flex-1"
              data-testid="input-hashrate"
            />
            <Select value={hashRateUnit} onValueChange={setHashRateUnit} data-testid="select-hashrate-unit">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TH/s">TH/s</SelectItem>
                <SelectItem value="GH/s">GH/s</SelectItem>
                <SelectItem value="MH/s">MH/s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Power Consumption (W)</Label>
          <Input
            type="number"
            placeholder="3250"
            value={powerConsumption}
            onChange={(e) => setPowerConsumption(e.target.value)}
            data-testid="input-power"
          />
        </div>
        
        <div>
          <Label className="block text-sm font-medium mb-2">Electricity Cost ($/kWh)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.12"
            value={electricityCost}
            onChange={(e) => setElectricityCost(e.target.value)}
            data-testid="input-electricity-cost"
          />
        </div>
        
        <Button
          className="w-full"
          onClick={handleCalculate}
          disabled={calculateMutation.isPending || !hashRate || !powerConsumption}
          data-testid="button-calculate"
        >
          {calculateMutation.isPending ? "Calculating..." : "Calculate Profitability"}
        </Button>
        
        {result && (
          <div className="bg-muted/30 rounded-lg p-4 mt-4" data-testid="calculation-result">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Revenue:</span>
                <span className="text-green-500 font-medium" data-testid="result-revenue">
                  ${result.revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Costs:</span>
                <span className="text-red-500 font-medium" data-testid="result-costs">
                  ${result.costs.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Daily Profit:</span>
                <span className={`font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="result-profit">
                  ${result.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Crypto Amount:</span>
                <span data-testid="result-crypto-amount">
                  {result.cryptoAmount.toFixed(6)} {cryptocurrency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
