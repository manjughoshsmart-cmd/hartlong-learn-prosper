import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Home, TrendingUp, BarChart3, PieChart, Layers, BookOpen, Wrench, Calculator, Shield, LogIn, UserPlus } from "lucide-react";

const sections = [
  {
    title: "Main Pages",
    links: [
      { path: "/", label: "Home", icon: Home },
      { path: "/equity", label: "Equity", icon: TrendingUp },
      { path: "/option", label: "Options", icon: BarChart3 },
      { path: "/mutual-fund", label: "Mutual Funds", icon: PieChart },
      { path: "/etf", label: "ETFs", icon: Layers },
      { path: "/resources", label: "Resources", icon: BookOpen },
    ],
  },
  {
    title: "Tools",
    links: [
      { path: "/tools", label: "All Tools", icon: Wrench },
      { path: "/tools/sip", label: "SIP Calculator", icon: Calculator },
      { path: "/tools/compound", label: "Compound Interest Calculator", icon: Calculator },
      { path: "/tools/profit-loss", label: "Profit & Loss Calculator", icon: Calculator },
      { path: "/tools/brokerage", label: "Brokerage Calculator", icon: Calculator },
    ],
  },
  {
    title: "Account",
    links: [
      { path: "/login", label: "Login", icon: LogIn },
      { path: "/register", label: "Register", icon: UserPlus },
      { path: "/dashboard", label: "Dashboard", icon: Home },
    ],
  },
  {
    title: "Legal",
    links: [
      { path: "/privacy-policy", label: "Privacy Policy", icon: Shield },
    ],
  },
];

const Sitemap = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sitemap</h1>
        <p className="text-muted-foreground mb-10">
          A complete overview of all pages on HartLong Trading.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Sitemap;
