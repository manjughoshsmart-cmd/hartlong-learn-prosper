import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <tab.icon className="h-5 w-5" />
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
