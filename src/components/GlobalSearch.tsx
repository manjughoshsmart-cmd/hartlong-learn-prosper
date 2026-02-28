import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  TrendingUp,
  BookOpen,
  Calculator,
  LayoutDashboard,
  Bookmark,
  Download,
  Search,
  User,
  Settings,
} from "lucide-react";

const pages = [
  { name: "Home", path: "/", icon: TrendingUp, group: "Pages" },
  { name: "Equity", path: "/equity", icon: TrendingUp, group: "Markets" },
  { name: "Options", path: "/option", icon: TrendingUp, group: "Markets" },
  { name: "Mutual Funds", path: "/mutual-fund", icon: TrendingUp, group: "Markets" },
  { name: "ETFs", path: "/etf", icon: TrendingUp, group: "Markets" },
  { name: "Resources", path: "/resources", icon: BookOpen, group: "Pages" },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, group: "Pages" },
  { name: "Bookmarks", path: "/dashboard/bookmarks", icon: Bookmark, group: "Pages" },
  { name: "Downloads", path: "/dashboard/downloads", icon: Download, group: "Pages" },
  { name: "Profile Settings", path: "/dashboard/profile", icon: User, group: "Pages" },
  { name: "SIP Calculator", path: "/tools/sip", icon: Calculator, group: "Tools" },
  { name: "Compound Calculator", path: "/tools/compound", icon: Calculator, group: "Tools" },
  { name: "Profit/Loss Calculator", path: "/tools/profit-loss", icon: Calculator, group: "Tools" },
  { name: "Brokerage Calculator", path: "/tools/brokerage", icon: Calculator, group: "Tools" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const select = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate]
  );

  const groups = pages.reduce<Record<string, typeof pages>>((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, tools, markets..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groups).map(([group, items], i) => (
            <div key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((item) => (
                  <CommandItem key={item.path} onSelect={() => select(item.path)} className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
