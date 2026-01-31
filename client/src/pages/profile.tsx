import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, User, Mail, Calendar, Shield } from "lucide-react";
import { SiX, SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { Link } from "wouter";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-400 mb-4">Please sign in to view your profile</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email 
      ? user.email[0].toUpperCase()
      : 'U';

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email || 'User';

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={user.profileImageUrl || undefined} 
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-orange-600 text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-white text-2xl" data-testid="text-profile-name">
              {displayName}
            </CardTitle>
            <CardDescription className="text-gray-400">
              WealthSage Member
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm" data-testid="text-user-id">{user.id}</p>
                </div>
              </div>

              {user.email && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p data-testid="text-user-email">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p data-testid="text-member-since">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Connected Accounts</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Your account is linked through secure authentication. You can sign in with:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 flex items-center gap-1">
                  <SiX className="h-3 w-3" /> X (Twitter)
                </Badge>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 flex items-center gap-1">
                  <SiGoogle className="h-3 w-3" /> Google
                </Badge>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 flex items-center gap-1">
                  <SiGithub className="h-3 w-3" /> GitHub
                </Badge>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 flex items-center gap-1">
                  <SiApple className="h-3 w-3" /> Apple
                </Badge>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
