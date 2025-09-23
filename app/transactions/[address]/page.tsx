// app/transactions/[address]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

interface Transfer {
  hash: string;
  blockNum: string;
  from: string;
  to: string;
  value?: string;
  metadata?: { blockTimestamp: string };
}

export default function TransactionsPage() {
  const { address } = useParams<{ address: string }>();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageKey, setPageKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    fetchTransfers();
  }, [address]);

  const fetchTransfers = async (nextPageKey: string | null = null) => {
    setLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, blockchain: 'ethereum', pageKey: nextPageKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      const allTransfers = nextPageKey ? [...transfers, ...data.transfers] : data.transfers;
      setTransfers(allTransfers);
      setPageKey(data.pageKey);
    } catch (err) {
      console.error('[v0] Fetch transactions error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pageKey) fetchTransfers(pageKey);
  };

  if (loading && transfers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p>No wallet address provided.</p>
            <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>
            Transactions for {address.slice(0, 6)}...{address.slice(-4)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tx Hash</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {tx.hash.slice(0, 10)}...
                      </a>
                    </TableCell>
                    <TableCell>{parseInt(tx.blockNum, 16)}</TableCell>
                    <TableCell>
                      {tx.metadata?.blockTimestamp
                        ? new Date(tx.metadata.blockTimestamp).toLocaleString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'N/A'}
                    </TableCell>
                    <TableCell>{tx.value ? `${parseFloat(tx.value).toFixed(4)} ETH` : '0'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pageKey && (
            <div className="mt-4 flex justify-center">
              <Button onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
          {transfers.length === 0 && <p className="text-center text-gray-500 mt-4">No transactions found.</p>}
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:underline">Back to NFT Viewer</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
