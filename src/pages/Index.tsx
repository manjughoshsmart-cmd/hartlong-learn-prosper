import { useEffect, useRef, useMemo } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { useTheme } from "@/hooks/useTheme";

export default function Index() {
  const websiteJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HartLong Trading",
    url: "https://hartlong.lovable.app",
    description: "Master stock market trading with HartLong. Free equity, options, mutual fund & ETF courses, trading tools, and expert resources.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://hartlong.lovable.app/resources?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }), []);
  const orgJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HartLong Trading",
    url: "https://hartlong.lovable.app",
    logo: "https://hartlong.lovable.app/favicon.ico",
    sameAs: [],
  }), []);
  const tickerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const colorTheme = theme === "dark" ? "dark" : "light";

  // Ticker Tape - recreate on theme change
  useEffect(() => {
    const container = tickerRef.current;
    if (!container) return;
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
        { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "NSE:NIFTY", title: "Nifty 50" },
        { proName: "BSE:SENSEX", title: "Sensex" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme,
      locale: "en",
    });
    container.appendChild(script);
  }, [colorTheme]);

  // Chart - recreate on theme change
  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;
    const chartDiv = document.getElementById("tradingview-chart");
    if (chartDiv) chartDiv.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          container_id: "tradingview-chart",
          autosize: true,
          symbol: "BITSTAMP:BTCUSD",
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: colorTheme,
          style: "1",
          locale: "en",
          toolbar_bg: "rgba(0,0,0,0)",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
        });
      }
    };
    container.appendChild(script);
  }, [colorTheme]);

  // World Indices Heatmap - recreate on theme change
  useEffect(() => {
    const container = heatmapRef.current;
    if (!container) return;
    container.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      symbolsGroups: [
        {
          name: "Major Indices",
          originalName: "Indices",
          symbols: [
            { name: "FOREXCOM:SPXUSD", displayName: "S&P 500" },
            { name: "FOREXCOM:NSXUSD", displayName: "Nasdaq 100" },
            { name: "FOREXCOM:DJI", displayName: "Dow 30" },
            { name: "INDEX:NKY", displayName: "Nikkei 225" },
            { name: "INDEX:DEU40", displayName: "DAX Index" },
            { name: "FOREXCOM:UKXGBP", displayName: "FTSE 100" },
            { name: "NSE:NIFTY", displayName: "Nifty 50" },
            { name: "BSE:SENSEX", displayName: "Sensex" },
            { name: "HSI:HSI", displayName: "Hang Seng" },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme,
      locale: "en",
    });
    container.appendChild(script);
  }, [colorTheme]);

  return (
    <Layout>
      <SEOHead
        canonical="/"
        jsonLd={websiteJsonLd}
      />
      <div className="flex flex-col gap-4 p-4 pb-20">
        {/* Ticker Tape */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <h2 className="text-base font-display font-semibold text-foreground">📈 Live Market</h2>
          </div>
          <div className="tradingview-widget-container" ref={tickerRef}>
            <div className="tradingview-widget-container__widget" />
          </div>
        </div>

        {/* YouTube Channel Section */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <div>
                <h2 className="text-base font-display font-semibold text-foreground">HartLong Trading</h2>
                <p className="text-xs text-muted-foreground">Learn trading on YouTube – free tutorials, market analysis & strategies</p>
              </div>
            </div>
            <a
              href="https://youtube.com/@hartlong_trading?si=_VAhXRYTw7JX_Tya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-sm px-4 py-2 rounded-lg transition-colors w-fit"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe
            </a>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-xl overflow-hidden flex-1">
          <div className="px-4 pt-3 pb-1">
            <h2 className="text-base font-display font-semibold text-foreground">📊 Live BTC Chart & 🌍 World Indices</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-3 p-2">
            <div style={{ width: "500px", height: "500px", maxWidth: "100%" }}>
              <div id="tradingview-chart" ref={chartRef} className="h-full w-full" />
            </div>
            <div className="flex-1 min-w-0" style={{ height: "500px", minHeight: "500px" }}>
              <div className="tradingview-widget-container h-full w-full" ref={heatmapRef}>
                <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
