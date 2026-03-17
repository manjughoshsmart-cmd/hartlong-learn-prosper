import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Markets</h3>
            <nav aria-label="Market links" className="flex flex-col gap-1.5">
              <Link to="/equity" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Equity</Link>
              <Link to="/option" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Options</Link>
              <Link to="/mutual-fund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mutual Funds</Link>
              <Link to="/etf" className="text-sm text-muted-foreground hover:text-foreground transition-colors">ETFs</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Tools</h3>
            <nav aria-label="Tool links" className="flex flex-col gap-1.5">
              <Link to="/tools/sip" className="text-sm text-muted-foreground hover:text-foreground transition-colors">SIP Calculator</Link>
              <Link to="/tools/compound" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compound Interest</Link>
              <Link to="/tools/profit-loss" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Profit/Loss</Link>
              <Link to="/tools/brokerage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Brokerage</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Company</h3>
            <nav aria-label="Company links" className="flex flex-col gap-1.5">
              <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/sitemap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sitemap</Link>
            </nav>
          </div>
        </div>
        <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} HartLong Trading. Decode the Market 📉</span>
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
