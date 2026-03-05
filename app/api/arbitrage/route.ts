// app/api/arbitrage/route.ts
import { NextResponse } from 'next/server';

// CAUTION: Crucial architectural constraint for Vercel Free Tier & GeckoTerminal rate limits.
// Cache this response globally on the Vercel Edge for 60 seconds.
export const revalidate = 60; 

// Only EVM chains are supported, as requested.
const EVM_CHAINS: Record<string, string> = {
  eth: 'Ethereum',
  bsc: 'BSC',
  arbitrum: 'Arbitrum',
  polygon_pos: 'Polygon',
  base: 'Base',
  optimism: 'Optimism',
  avax: 'Avalanche'
};

export async function GET() {
  try {
    const fetchPools = Object.keys(EVM_CHAINS).map(async (chain) => {
      // Fetching trending pools for each EVM chain.
      const res = await fetch(https://api.geckoterminal.com/api/v2/networks/${chain}/trending_pools?include=base_token,dex, {
        headers: { 'Accept': 'application/json;version=20230203' },
        next: { revalidate: 60 } // Double-layer cache.
      });
      const json = await res.json();
      return json.data || [];
    });

    const allPools = (await Promise.all(fetchPools)).flat();
    const groups: Record<string, any[]> = {};

    allPools.forEach(pool => {
      const symbol = pool.attributes.symbol.split(' / ')[0];
      const liquidity = parseFloat(pool.attributes.reserve_in_usd);
      
      // Filter: $1,000 Minimum Liquidity, as requested.
      if (liquidity < 1000) return;

      if (!groups[symbol]) groups[symbol] = [];
      groups[symbol].push(pool);
    });

    const opportunities = Object.keys(groups).map(symbol => {
      // Sort by price (low to high).
      const pools = groups[symbol].sort((a, b) => 
        parseFloat(a.attributes.token_price_usd) - parseFloat(b.attributes.token_price_usd)
      );
      if (pools.length < 2) return null; // Need at least two pools to arbitrage.

      const low = pools[0];
      const high = pools[pools.length - 1];
      const lowPrice = parseFloat(low.attributes.token_price_usd);
      const highPrice = parseFloat(high.attributes.token_price_usd);
      
      const spread = ((highPrice - lowPrice) / lowPrice) * 100;

      return {
        symbol,
        // Extracting Token Address (CA).
        tokenAddress: low.relationships.base_token.data.id.split('_')[1],
        spread: parseFloat(spread.toFixed(2)),
        liquidity: parseFloat(high.attributes.reserve_in_usd),
        buy: { 
          dex: low.relationships.dex.data.id.toUpperCase().replace('_', ' '), 
          price: lowPrice, 
          chain: EVM_CHAINS[low.relationships.network.data.id],
          link: https://www.geckoterminal.com/${low.relationships.network.data.id}/pools/${low.attributes.address}
        },
        sell: { 
          dex: high.relationships.dex.data.id.toUpperCase().replace('_', ' '), 
          price: highPrice, 
          chain: EVM_CHAINS[high.relationships.network.data.id]
        }
      };
    }).filter(Boolean);

    // THE RANKING SYSTEM: Sort by Highest Spread first, as requested.
    const rankedData = opportunities.sort((a: any, b: any) => b.spread - a.spread);

    return NextResponse.json({ ranked: rankedData });

  } catch (error) {
    // Graceful error handling to prevent Vercel 500 crashes.
    return NextResponse.json({ error: "Failed to fetch arbitrage data", detail: error }, { status: 500 });
  }
}
