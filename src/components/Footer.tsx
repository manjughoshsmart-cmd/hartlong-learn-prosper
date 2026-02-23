import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-gradient-primary">HartLong Trading</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium trading education platform. Master equity, options, mutual funds and ETFs.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Learn</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/equity" className="hover:text-foreground transition-colors">Equity</Link>
              <Link to="/option" className="hover:text-foreground transition-colors">Options</Link>
              <Link to="/mutual-fund" className="hover:text-foreground transition-colors">Mutual Funds</Link>
              <Link to="/etf" className="hover:text-foreground transition-colors">ETFs</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Tools</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/tools/sip" className="hover:text-foreground transition-colors">SIP Calculator</Link>
              <Link to="/tools/compound" className="hover:text-foreground transition-colors">Compound Interest</Link>
              <Link to="/tools/profit-loss" className="hover:text-foreground transition-colors">Profit/Loss</Link>
              <Link to="/tools/brokerage" className="hover:text-foreground transition-colors">Brokerage</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/resources" className="hover:text-foreground transition-colors">Resources</Link>
              <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HartLong Trading. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
