import CategoryPage from "@/components/CategoryPage";
import SEOHead from "@/components/SEOHead";
export default function Option() {
  return (
    <>
      <SEOHead
        title="Options Trading – Strategies, Greeks & Advanced Techniques"
        description="Learn options trading from basics to advanced strategies like Iron Condors, Straddles, and more. Free options education on HartLong."
        canonical="/option"
      />
      <CategoryPage category="option" title="Options Trading" description="Learn options from basics to advanced strategies like Iron Condors, Straddles, and more." />
    </>
  );
}
