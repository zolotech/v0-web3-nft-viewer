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

    // Process transactions to flag approvals and check allowances
    const processedTransfers = await Promise.all(
      data.result.transfers.map(async (transfer: any) => {
        let isApproval = false;
        let activeAllowance = '0';
        const method = transfer.metadata?.method || 'Unknown';
        const data = transfer.rawContract?.data || '';

        // Check for approve (0x095ea7b3) or increaseAllowance (0x39509351)
        if (data.startsWith('0x095ea7b3') || data.startsWith('0x39509351')) {
          isApproval = true;
          // Extract spender (bytes 4-36)
          const spender = `0x${data.slice(10, 74).replace(/^0+/, '')}`;
          if (transfer.rawContract?.address) {
            try {
              const allowanceData = await alchemy.core.call({
                to: transfer.rawContract.address,
                data: `0xdd62ed3e${walletAddress.replace('0x', '').padStart(64, '0')}${spender.replace('0x', '').padStart(64, '0')}`, // allowance(owner, spender)
              });
              activeAllowance = BigInt(allowanceData).toString();
            } catch (error) {
              console.error(`[v0] Failed to fetch allowance for ${transfer.hash}:`, error);
            }
          }
        } else if (method.toLowerCase().includes('approve') || method.toLowerCase().includes('increaseallowance')) {
          isApproval = true; // Fallback for metadata
        }

        return {
          ...transfer,
          isApproval: isApproval && activeAllowance !== '0', // Only flag active approvals
          method: isApproval ? (data.startsWith('0x095ea7b3') ? 'approve' : 'increaseAllowance') : method,
          activeAllowance, // For debugging/display
        };
      })
    );

    // Log the results to the console
    console.log('Processed Transfers:', processedTransfers);



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
