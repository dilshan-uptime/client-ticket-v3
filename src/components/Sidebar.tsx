import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useAppSelector } from "@/hooks/store-hooks";
import { getAuth } from "@/app/redux/authSlice";
import { useTheme } from "@/contexts/ThemeContext";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { performLogout } from "@/utils/logout-helper";

import { 
  Home, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();
  const auth = useAppSelector(getAuth);
  const { theme, toggleTheme } = useTheme();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    performLogout(instance);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col smooth-transition z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border smooth-transition">
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#ee754e] to-[#f49b71] bg-clip-text text-transparent">
            uptime
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent smooth-transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium smooth-transition ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                active
                  ? "bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 text-[#ee754e] shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 space-y-3 smooth-transition">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium smooth-transition text-sidebar-foreground hover:bg-sidebar-accent ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Sun className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* User Profile */}
        {auth?.user && (
          <div className={`flex items-center gap-3 px-3 py-2 smooth-transition ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ee754e] to-[#f49b71] flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
              {auth.user.firstName?.[0]?.toUpperCase() || '?'}
              {auth.user.lastName?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-sm text-sidebar-foreground truncate">
                  {auth.user.firstName} {auth.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {auth.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium smooth-transition text-destructive hover:bg-destructive/10 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogoutConfirm}
      />
    </aside>
  );
};
