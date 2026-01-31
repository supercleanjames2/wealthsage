import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiX, SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { TrendingUp, Pickaxe, Wallet, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-tight" data-testid="text-hero-title">
              WealthSage
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl" data-testid="text-hero-description">
              Your intelligent cryptocurrency mining dashboard. Monitor rigs, track portfolio, and maximize your mining profits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl mt-12">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <Pickaxe className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle className="text-white text-lg">Mining Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Monitor all your mining rigs in real-time
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <Wallet className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-white text-lg">Portfolio Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Track your crypto holdings and earnings
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-white text-lg">Live Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Real-time cryptocurrency price updates
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-white text-lg">Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Calculate and optimize your mining profits
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full max-w-md mt-12 bg-gray-800/80 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Get Started</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in with your preferred account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-white hover:bg-gray-100 text-black"
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-2">
                    <SiX className="h-4 w-4" />
                    <SiGoogle className="h-4 w-4" />
                    <SiGithub className="h-4 w-4" />
                    <SiApple className="h-4 w-4" />
                  </div>
                  <span>Sign In</span>
                </div>
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Login with X, Google, GitHub, Apple, or email
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500 mt-8">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}
