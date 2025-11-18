import { useMsal } from '@azure/msal-react';
import { LogOut, Bell, Settings, User } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Navbar = () => {
  const { instance, accounts } = useMsal();
  
  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: '/',
    });
  };

  const userDisplayName = accounts[0]?.name || 'User';
  const userEmail = accounts[0]?.username || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="Uptime" 
              className="h-8 w-auto"
            />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#dashboard-content" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="#scored-section" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Scored Tickets
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full"></span>
            </button>

            <button 
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            <div className="h-8 w-px bg-border"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{userDisplayName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-semibold">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-all"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
