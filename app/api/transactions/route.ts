// app/api/transactions/route.ts
import { type NextRequest, NextResponse } from 'next/server';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, blockchain, pageKey } = await request.json();

    console.log('[v0] Transactions API request received:', { walletAddress, blockchain, pageKey });

    if (!walletAddress || !blockchain) {
      return NextResponse.json({ error: 'Missing walletAddress or blockchain' }, { status: 400 });
    }

    if (blockchain !== 'ethereum') {
      return NextResponse.json({ error: `Unsupported blockchain: ${blockchain}` }, { status: 400 });
    }

    if (!ALCHEMY_API_KEY) {
      console.error('[v0] Alchemy API key not configured');
      throw new Error('Alchemy API key not configured');
    }

    const url = new URL(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          fromAddress: walletAddress,
          category: ['external', 'erc721', 'internal'],
          withMetadata: true,
          pageKey: pageKey || undefined,
          maxCount: '0x3e8', // 1000 transactions
          order: 'desc',
        }],
        id: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Alchemy API error:', response.status, errorText);
      throw new Error(`Alchemy API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      console.error('[v0] Alchemy API error response:', data.error);
      throw new Error(`Alchemy API error: ${data.error.message}`);
    }

    console.log('[v0] Alchemy transactions received, count:', data.result.transfers.length);

    return NextResponse.json({
      transfers: data.result.transfers,
      pageKey: data.result.pageKey || null,
    });
  } catch (error) {
    console.error('[v0] Transactions API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
