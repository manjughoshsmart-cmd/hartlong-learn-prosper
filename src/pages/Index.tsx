import { useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";

export default function Index() {
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
      {/* Ticker Tape */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-display font-semibold text-foreground mb-2">📈 Live Market</h2>
      </div>
      <div className="tradingview-widget-container border-b border-border/40" ref={tickerRef}>
        <div className="tradingview-widget-container__widget" />
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-display font-semibold text-foreground mb-2">📊 Live BTC Chart</h2>
      </div>
      <div className="flex-1 w-full" style={{ height: "calc(100vh - 14rem)" }}>
        <div id="tradingview-chart" ref={chartRef} className="h-full w-full" />
      </div>
    </Layout>
  );
}
