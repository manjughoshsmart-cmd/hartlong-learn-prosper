import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Decode the Market 📉 | Designed by HartLong</span>
        <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
