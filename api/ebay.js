export const config = {
  runtime: "nodejs18.x"
};

export default async function handler(req, res) {

  const item = req.query.item;
  if (!item) return res.status(400).json({ error: "No item provided" });

  try {

    // STEP 1: Get OAuth token from eBay
    const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(process.env.EBAY_APP_ID + ":").toString("base64")
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope"
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // STEP 2: Search sold listings
    const searchRes = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(item)}&filter=soldItems:true&limit=20`,
      {
        headers: {
          "Authorization": "Bearer " + accessToken,
          "Content-Type": "application/json"
        }
      }
    );

    const searchData = await searchRes.json();

    if (!searchData.itemSummaries) {
      return res.json({ error: "No sold data found" });
    }

    const prices = searchData.itemSummaries
      .map(i => parseFloat(i.price.value))
      .filter(p => !isNaN(p));

    const avg = prices.reduce((a,b)=>a+b,0)/prices.length;

    res.json({
      average: avg.toFixed(2),
      count: prices.length
    });

  } catch (err) {
    res.status(500).json({ error: "eBay API failed", details: err.message });
  }
}
