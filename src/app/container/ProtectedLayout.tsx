import { SideBar } from "@/app/component/SideBar.component";
import { useState, type ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const [collapsed, setCollapsed] = useState(true);

  const sidebarWidth = collapsed ? 80 : 280;

  return (
    <div className="relative min-h-screen bg-[#f9fafc] text-foreground">
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className="p-6"
        style={{
          marginLeft: sidebarWidth,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
};
