import { useEffect, useRef } from "react";
import Layout from "@/components/Layout";

export default function Index() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ticker Tape Widget
    if (tickerRef.current && !tickerRef.current.querySelector("script")) {
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
        colorTheme: "dark",
        locale: "en",
      });
      tickerRef.current.appendChild(script);
    }

    // Advanced Chart Widget
    if (chartRef.current && !chartRef.current.querySelector("script")) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).TradingView) {
          new (window as any).TradingView.widget({
            container_id: "tradingview-chart",
            autosize: true,
            symbol: "NSE:NIFTY",
            interval: "D",
            timezone: "Asia/Kolkata",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "rgba(0,0,0,0)",
            enable_publishing: false,
            allow_symbol_change: true,
            hide_side_toolbar: false,
          });
        }
      };
      chartRef.current.appendChild(script);
    }
  }, []);

  return (
    <Layout>
      {/* Ticker Tape */}
      <div className="tradingview-widget-container border-b border-border/40" ref={tickerRef}>
        <div className="tradingview-widget-container__widget" />
      </div>

      {/* Chart */}
      <div className="flex-1 w-full" style={{ height: "calc(100vh - 10rem)" }}>
        <div id="tradingview-chart" ref={chartRef} className="h-full w-full" />
      </div>
    </Layout>
  );
}
