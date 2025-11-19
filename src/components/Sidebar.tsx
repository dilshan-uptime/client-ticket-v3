import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useAppDispatch, useAppSelector } from "@/hooks/store-hooks";
import { authActions, getAuth } from "@/app/redux/authSlice";
import storage from "@/services/storage/local-storage";
import { AUTH_RESPONSE } from "@/constants/storage";
import { useTheme } from "@/contexts/ThemeContext";

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
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { instance } = useMsal();
  const auth = useAppSelector(getAuth);
  const { theme, toggleTheme } = useTheme();

  const onLogout = () => {
    dispatch(authActions.logoutUser());
    storage.remove(AUTH_RESPONSE);
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#ee754e] to-[#f49b71] bg-clip-text text-transparent">
            uptime
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                active
                  ? "bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 text-[#ee754e] dark:from-[#ee754e]/20 dark:to-[#f49b71]/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${
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
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ee754e] to-[#f49b71] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {auth.user.firstName?.[0]?.toUpperCase() || '?'}
              {auth.user.lastName?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {auth.user.firstName} {auth.user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {auth.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
