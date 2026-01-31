import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Pickaxe, Wallet, ArrowLeftRight, CreditCard, Calculator, Settings, User, LogOut } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mining", label: "Mining Operations", icon: Pickaxe },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/exchanges", label: "Exchanges", icon: ArrowLeftRight },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email 
      ? user.email[0].toUpperCase()
      : 'U';

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'User';

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-2 mb-8" data-testid="logo">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Pickaxe className="text-white h-4 w-4" />
          </div>
          <span className="text-xl font-bold">WealthSage</span>
        </div>
        
        <nav className="space-y-2" data-testid="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  location === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/profile"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors mb-2",
            location === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          data-testid="nav-profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.profileImageUrl || undefined} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-orange-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-sidebar-username">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">View Profile</p>
          </div>
        </Link>
        <button
          onClick={() => window.location.href = '/api/logout'}
          className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-destructive hover:text-destructive-foreground w-full"
          data-testid="button-sidebar-logout"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
