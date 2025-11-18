import { useAppDispatch, useAppSelector } from "@/hooks/store-hooks";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FiSidebar, FiLogOut } from "react-icons/fi";
import { FaHome } from "react-icons/fa";
import { cn } from "@/lib/utils";

import { userSignOut } from "@/services/api/user-api";

import { errorHandler } from "@/services/other/error-handler";

import { authActions, getAuth } from "../redux/authSlice";

import { LOGIN } from "@/modules/auth/routes";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  collapsed: boolean;
}

const MenuItem = ({ icon, label, onClick, collapsed }: MenuItemProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded font-medium text-base transition-colors justify-start",
      "text-white hover:bg-white/15 hover:text-white",
      collapsed && "justify-center"
    )}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </Button>
);

export const SideBar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector(getAuth);

  const onLogout = () => {
    if (auth?.refreshToken) {
      userSignOut({
        refreshToken: auth?.refreshToken,
      }).subscribe({
        next: (response: boolean) => {
          dispatch(authActions.logoutUser());

          navigate(LOGIN);
        },

        error: (e) => {
          errorHandler(e);

          navigate(LOGIN);
        },

        complete() {},
      });
    } else {
      navigate(LOGIN);
    }
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen text-white flex flex-col justify-between transition-all duration-300 z-40",
        "bg-[#ef764c]",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div>
        <div className="flex items-center justify-between p-4">
          {/* {!collapsed && (
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-20 object-contain select-none"
              draggable={false}
            />
          )} */}
          <Button
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-white/15 hover:text-white p-1 rounded transition-colors duration-200"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FiSidebar size={24} />
          </Button>
        </div>

        {/* <div className="flex-1 overflow-auto p-5"></div> */}

        {/* Menu  */}
        <div className="flex-1 p-3 space-y-1">
          <MenuItem
            icon={<FaHome size={20} />}
            label="Home"
            collapsed={collapsed}
            onClick={() => navigate("/")}
          />
        </div>
      </div>

      <div className="px-5 py-4">
        <Separator className="my-3 bg-orange-400" />

        <div
          className="flex items-center space-x-3 cursor-pointer"
          // onClick={() => {
          //   navigate(`/users/${auth?.user.publicId}`);
          // }}
        >
          <Avatar>
            {/* <AvatarImage src={`/${auth?.user?.profileUrl}`} alt="User Name" /> */}
            <AvatarFallback className="bg-orange-300 text-white text-sm">
              {auth?.user.firstName?.[0].toUpperCase()}
              {auth?.user.lastName?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="font-medium text-white truncate text-left text-md leading-tight">
                {`${auth?.user.firstName} ${auth?.user.lastName}`}
              </span>
              <span className="text-sm truncate text-left mt-0.5 text-orange-300">
                {/* {auth?.user?.currentRole} */}
              </span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 mt-4 px-3 py-2 rounded font-semibold transition-colors justify-start",
            "text-white hover:bg-white/15 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          <FiLogOut size={20} />
          {!collapsed && <span>Log Out</span>}
        </Button>
      </div>
    </aside>
  );
};
