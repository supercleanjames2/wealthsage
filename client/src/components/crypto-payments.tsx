import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Payment } from "@shared/schema";

const PAYMENT_ADDRESS = "0xE5A9CBDde1be6d164d32922d66B36d2f1E91d939";

interface PaymentFormData {
  network: string;
  amount: string;
  currency: string;
  purpose: string;
  fromAddress: string;
}

export function CryptoPayments() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PaymentFormData>({
    network: "ethereum",
    amount: "",
    currency: "ETH",
    purpose: "mining_purchase",
    fromAddress: ""
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const paymentPayload: any = {
        network: data.network,
        amount: parseFloat(data.amount),
        currency: data.currency,
        toAddress: PAYMENT_ADDRESS,
        purpose: data.purpose,
        status: "pending"
      };
      
      // Only include fromAddress if it's provided (avoid sending null)
      if (data.fromAddress && data.fromAddress.trim()) {
        paymentPayload.fromAddress = data.fromAddress.trim();
      }
      
      return await queryClient.fetchQuery({
        queryKey: ["create-payment"],
        queryFn: async () => {
          const response = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentPayload),
          });
          if (!response.ok) throw new Error("Failed to create payment");
          return response.json();
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setFormData({ ...formData, amount: "", fromAddress: "" });
      toast({
        title: "Payment Initiated",
        description: "Your payment has been recorded. Please send the funds to the provided address.",
      });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }
    createPaymentMutation.mutate(formData);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Payment address copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const getNetworkIcon = (network: string) => {
    return network === "ethereum" ? "fab fa-ethereum" : "fas fa-vector-square";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "failed":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6" data-testid="crypto-payments">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card data-testid="payment-form">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-wallet text-primary"></i>
              <span>Make Crypto Payment</span>
            </CardTitle>
            <CardDescription>
              Send Ethereum or Polygon payments for mining services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Network</Label>
                <Select 
                  value={formData.network} 
                  onValueChange={(value) => setFormData({ ...formData, network: value, currency: value === "ethereum" ? "ETH" : "MATIC" })}
                  data-testid="select-network"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum Network</SelectItem>
                    <SelectItem value="polygon">Polygon Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  data-testid="select-currency"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.network === "ethereum" ? (
                      <>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="MATIC">MATIC</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Amount</Label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="0.1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  data-testid="input-amount"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Purpose</Label>
                <Select 
                  value={formData.purpose} 
                  onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  data-testid="select-purpose"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mining_purchase">Mining Hardware Purchase</SelectItem>
                    <SelectItem value="service_fee">Service Fee</SelectItem>
                    <SelectItem value="subscription">Subscription Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Your Wallet Address (Optional)</Label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={formData.fromAddress}
                  onChange={(e) => setFormData({ ...formData, fromAddress: e.target.value })}
                  data-testid="input-from-address"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createPaymentMutation.isPending}
                data-testid="button-create-payment"
              >
                {createPaymentMutation.isPending ? "Creating Payment..." : "Create Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Address */}
        <Card data-testid="payment-address">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-qrcode text-primary"></i>
              <span>Payment Address</span>
            </CardTitle>
            <CardDescription>
              Send your cryptocurrency payments to this address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Payment Address:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(PAYMENT_ADDRESS)}
                  data-testid="button-copy-address"
                >
                  <i className="fas fa-copy mr-1"></i>
                  Copy
                </Button>
              </div>
              <div className="font-mono text-sm break-all bg-background rounded p-2" data-testid="payment-address-text">
                {PAYMENT_ADDRESS}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Supported Networks:</span>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <i className="fab fa-ethereum text-blue-500"></i>
                  <span>Ethereum</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <i className="fas fa-vector-square text-purple-500"></i>
                  <span>Polygon</span>
                </Badge>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-0.5"></i>
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">Important:</p>
                  <p className="text-muted-foreground mt-1">
                    Only send {formData.network === "ethereum" ? "Ethereum" : "Polygon"} network tokens to this address. 
                    Sending tokens from other networks may result in permanent loss.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card data-testid="payment-history">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-history text-primary"></i>
            <span>Payment History</span>
          </CardTitle>
          <CardDescription>
            Track your recent cryptocurrency payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`payment-${payment.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      payment.network === "ethereum" ? "bg-blue-500/20" : "bg-purple-500/20"
                    }`}>
                      <i className={`${getNetworkIcon(payment.network)} ${
                        payment.network === "ethereum" ? "text-blue-500" : "text-purple-500"
                      } text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`payment-amount-${payment.id}`}>
                        {payment.amount} {payment.currency}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`payment-purpose-${payment.id}`}>
                        {payment.purpose?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Payment"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(payment.status)} data-testid={`payment-status-${payment.id}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                    {payment.transactionHash && (
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`payment-hash-${payment.id}`}>
                        {formatAddress(payment.transactionHash)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-payments">
              <i className="fas fa-wallet text-4xl mb-4 opacity-50"></i>
              <p>No payments yet</p>
              <p className="text-sm">Your payment history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}