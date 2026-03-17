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

  return (
    <Layout>
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

        {/* Chart */}
        <div className="glass-card rounded-xl overflow-hidden flex-1">
          <div className="px-4 pt-3 pb-1">
            <h2 className="text-base font-display font-semibold text-foreground">📊 Live BTC Chart</h2>
          </div>
          <div className="w-full" style={{ height: "calc(100vh - 16rem)" }}>
            <div id="tradingview-chart" ref={chartRef} className="h-full w-full" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
