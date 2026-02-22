export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const item = (searchParams.get("item") || "").toLowerCase();

  if (!item) {
    return new Response(
      JSON.stringify({ error: "No item provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // temporary smart estimation engine
  // (real eBay data will plug in later)

  const base = Math.min(250, Math.max(8, item.length * 3.4));

  const ebayAvg = base;
  const amazonCeiling = base * 1.25;
  const marketplaceRealistic = base * 0.85;
  const quickFlip = base * 0.7;

  let verdict = "OK BUY";
  if (quickFlip > ebayAvg * 0.9) verdict = "AVOID";
  if (amazonCeiling - quickFlip > 40) verdict = "GOOD BUY";

  return new Response(
    JSON.stringify({
      ebay_average: ebayAvg.toFixed(2),
      amazon_ceiling: amazonCeiling.toFixed(2),
      marketplace_value: marketplaceRealistic.toFixed(2),
      quick_flip: quickFlip.toFixed(2),
      verdict
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
