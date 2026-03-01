import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Calculator, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Calculator, label: "Tools", path: "/tools" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path !== "/dashboard" && location.pathname.startsWith(tab.path));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
