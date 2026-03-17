import CategoryPage from "@/components/CategoryPage";
import SEOHead from "@/components/SEOHead";
export default function ETF() {
  return (
    <>
      <SEOHead
        title="ETF Investing – Exchange-Traded Fund Strategies"
        description="Diversify your portfolio with exchange-traded funds. Learn smart ETF strategies and investing techniques on HartLong."
        canonical="/etf"
      />
      <CategoryPage category="etf" title="ETF Investing" description="Diversify your portfolio with exchange-traded funds and learn smart ETF strategies." />
    </>
  );
}
