import hartlongLogo from "@/assets/hartlong-logo.png";

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <img src={hartlongLogo} alt="HartLong Logo" className="h-10 w-10 object-contain" />
        <span>Decode the Market 📉 | Designed by HartLong</span>
      </div>
    </footer>
  );
}
