// app/api/transactions/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import {
  consumeRateLimit,
  isSupportedBlockchain,
  isValidWalletAddress,
  normalizeWalletAddress,
} from '@/lib/api-security';
import { buildCacheKey, getCached, setCached } from '@/lib/api-cache';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const TRANSACTIONS_PAGE_TTL_MS = 45_000;

export async function POST(request: NextRequest) {
  const limitState = consumeRateLimit(request, 'api:transactions', 15, 60_000);
  if (!limitState.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limitState.retryAfterSeconds),
          'X-RateLimit-Limit': String(limitState.limit),
          'X-RateLimit-Remaining': String(limitState.remaining),
        },
      },
    );
  }

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const walletAddress = body?.walletAddress;
    const blockchain = body?.blockchain;
    const pageKey = body?.pageKey;

    console.log('[v0] Transactions API request received:', { walletAddress, blockchain, pageKey });

    if (typeof walletAddress !== 'string' || !isSupportedBlockchain(blockchain)) {
      return NextResponse.json({ error: 'Invalid walletAddress or blockchain' }, { status: 400 });
    }

    if (blockchain !== 'ethereum') {
      return NextResponse.json({ error: `Unsupported blockchain: ${blockchain}` }, { status: 400 });
    }

    if (!isValidWalletAddress(walletAddress, blockchain)) {
      return NextResponse.json({ error: `Invalid ${blockchain} wallet address format` }, { status: 400 });
    }

    if (pageKey != null && typeof pageKey !== 'string') {
      return NextResponse.json({ error: 'Invalid pageKey format' }, { status: 400 });
    }
    if (typeof pageKey === 'string' && pageKey.length > 2048) {
      return NextResponse.json({ error: 'pageKey too long' }, { status: 400 });
    }

    const normalizedWalletAddress = normalizeWalletAddress(walletAddress, blockchain);
    const transactionsCacheKey = buildCacheKey('transactions:page', [normalizedWalletAddress, pageKey ?? 'first']);
    const cachedTransactions = getCached<{ transfers: any[]; pageKey: string | null }>(transactionsCacheKey);
    if (cachedTransactions) {
      return NextResponse.json(cachedTransactions, {
        headers: {
          'X-RateLimit-Limit': String(limitState.limit),
          'X-RateLimit-Remaining': String(limitState.remaining),
          'X-Cache': 'HIT',
        },
      });
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
          fromAddress: normalizedWalletAddress,
          excludeZeroValue:false,
          category: ['external', 'internal', 'erc20', 'erc721', 'erc1155', 'specialnft'],
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

    // Process transactions to flag likely token approvals
    const processedTransfers = await Promise.all(
      data.result.transfers.map(async (transfer: any) => {
        let isApproval = false;
        const method = transfer.metadata?.method || 'Unknown';
        const rawData = transfer.rawContract?.data || '';

        // Check for approve (0x095ea7b3) or increaseAllowance (0x39509351)
        if (rawData.startsWith('0x095ea7b3') || rawData.startsWith('0x39509351')) {
          isApproval = true;
        } else if (method.toLowerCase().includes('approve') || method.toLowerCase().includes('increaseallowance')) {
          isApproval = true; // Fallback for metadata
        }

        return {
          ...transfer,
          isApproval,
          method: isApproval ? (rawData.startsWith('0x095ea7b3') ? 'approve' : 'increaseAllowance') : method,
        };
      })
    );

    // Log the results to the console
    console.log('Processed Transfers:', processedTransfers);



    const responsePayload = {
      transfers: processedTransfers,
      pageKey: data.result.pageKey || null,
    };

    setCached(transactionsCacheKey, responsePayload, TRANSACTIONS_PAGE_TTL_MS);

    return NextResponse.json(responsePayload, {
      headers: {
        'X-RateLimit-Limit': String(limitState.limit),
        'X-RateLimit-Remaining': String(limitState.remaining),
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[v0] Transactions API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
