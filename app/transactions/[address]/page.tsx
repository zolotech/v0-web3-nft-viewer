'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Shield, ShieldAlert, ShieldCheck, ArrowLeft, Activity, TrendingUp, AlertTriangle, CheckCircle2, Key, Bot, Clock, FileCheck, ExternalLink, XCircle } from 'lucide-react';

interface Transfer {
  hash: string;
  blockNum: string;
  from: string;
  to: string;
  value?: string;
  asset?: string;
  category?: string;
  metadata?: { blockTimestamp: string };
}

interface ApprovalTransaction {
  hash: string;
  spender: string;
  asset: string;
  timestamp: string;
  blockNum: string;
}

interface SecurityMetrics {
  score: number;
  totalTransactions: number;
  uniqueInteractions: number;
  largeTransactions: number;
  recentActivity: number;
  approvalCount: number;
  approvals: ApprovalTransaction[];
  sameBlockTxCount: number;
  newContractInteractions: number;
  walletAgeMonths: number;
  riskFactors: string[];
  positiveFactors: string[];
}

// Known verified contract addresses (major protocols)
const VERIFIED_CONTRACTS = new Set([
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap V3 Router
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0x Exchange Proxy
  '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch V5 Router
  '0x881d40237659c251811cec9c364ef91dc08d300c', // Metamask Swap Router
  '0x00000000006c3852cbef3e08e8df289169ede581', // OpenSea Seaport
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
]);

function calculateSecurityMetrics(transfers: Transfer[], walletAddress: string): SecurityMetrics {
  let score = 100;
  const riskFactors: string[] = [];
  const positiveFactors: string[] = [];

  // Count unique addresses interacted with
  const uniqueAddresses = new Set<string>();
  transfers.forEach(tx => {
    if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) uniqueAddresses.add(tx.from.toLowerCase());
    if (tx.to && tx.to.toLowerCase() !== walletAddress.toLowerCase()) uniqueAddresses.add(tx.to.toLowerCase());
  });
  const uniqueInteractions = uniqueAddresses.size;

  // Count large transactions (> 1 ETH)
  const largeTransactions = transfers.filter(tx => tx.value && parseFloat(tx.value) > 1).length;

  // Count recent activity (last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentActivity = transfers.filter(tx => {
    if (!tx.metadata?.blockTimestamp) return false;
    return new Date(tx.metadata.blockTimestamp).getTime() > thirtyDaysAgo;
  }).length;

  // ========== NEW SECURITY METRICS ==========

  // 1. Smart Contract Approvals Detection
  // Check for ERC20 approve transactions (category often indicates this)
  const approvalTransactions = transfers.filter(tx => {
    // Check if it's an approval by looking at category or zero value contract interactions
    const isApproval = tx.category?.toLowerCase().includes('approve') ||
      tx.category?.toLowerCase().includes('erc20') ||
      (tx.value === '0' && tx.to && tx.from.toLowerCase() === walletAddress.toLowerCase());
    return isApproval;
  });
  const approvalCount = approvalTransactions.length;
  
  // Map to ApprovalTransaction format for display
  const approvals: ApprovalTransaction[] = approvalTransactions.map(tx => ({
    hash: tx.hash,
    spender: tx.to || 'Unknown',
    asset: tx.asset || 'Unknown Token',
    timestamp: tx.metadata?.blockTimestamp || '',
    blockNum: tx.blockNum,
  }));

  if (approvalCount > 10) {
    score -= 20;
    riskFactors.push(`High number of token approvals (${approvalCount})`);
  } else if (approvalCount > 5) {
    score -= 10;
    riskFactors.push(`Multiple token approvals detected (${approvalCount})`);
  } else if (approvalCount === 0 && transfers.length > 10) {
    score += 10;
    positiveFactors.push('Clean slate: No token approvals detected');
  }

  // 2. Contract Interaction Safety
  // Check for interactions with unverified/unknown contracts
  let unverifiedInteractions = 0;
  let verifiedInteractions = 0;
  const interactedContracts = new Set<string>();

  transfers.forEach(tx => {
    const targetAddress = tx.to?.toLowerCase();
    if (targetAddress && targetAddress !== walletAddress.toLowerCase()) {
      interactedContracts.add(targetAddress);
      if (VERIFIED_CONTRACTS.has(targetAddress)) {
        verifiedInteractions++;
      } else {
        unverifiedInteractions++;
      }
    }
  });

  // Check for new contract interactions (contracts deployed within last 24 hours would need on-chain data)
  // For now, we penalize high ratio of unverified contract interactions
  const newContractInteractions = 0; // Would require additional API call to check contract age
  
  if (verifiedInteractions > 0) {
    positiveFactors.push(`Interactions with ${verifiedInteractions} verified protocols`);
    score += 5;
  }
  
  if (unverifiedInteractions > verifiedInteractions * 2 && unverifiedInteractions > 5) {
    score -= 15;
    riskFactors.push('High ratio of unverified contract interactions');
  }

  // 3. Behavioral "Human" Patterns - Same Block Transactions
  // Group transactions by block number to detect bot-like behavior
  const blockCounts = new Map<string, number>();
  transfers.forEach(tx => {
    const block = tx.blockNum;
    blockCounts.set(block, (blockCounts.get(block) || 0) + 1);
  });

  const sameBlockTxCount = Array.from(blockCounts.values()).filter(count => count > 1).length;
  const multipleTxInSameBlock = Array.from(blockCounts.entries()).filter(([, count]) => count >= 3);

  if (multipleTxInSameBlock.length > 3) {
    score -= 15;
    riskFactors.push('Bot-like behavior: Multiple transactions in same blocks');
  } else if (sameBlockTxCount > 5) {
    score -= 5;
    riskFactors.push('Possible automated transactions detected');
  }

  // 4. Wallet Age Analysis
  let walletAgeMonths = 0;
  if (transfers.length > 0) {
    const timestamps = transfers
      .filter(tx => tx.metadata?.blockTimestamp)
      .map(tx => new Date(tx.metadata!.blockTimestamp).getTime());
    
    if (timestamps.length > 0) {
      const oldestTx = Math.min(...timestamps);
      walletAgeMonths = Math.floor((Date.now() - oldestTx) / (30 * 24 * 60 * 60 * 1000));
      
      if (walletAgeMonths >= 12) {
        score += 10;
        positiveFactors.push(`Established wallet (${walletAgeMonths} months old)`);
      } else if (walletAgeMonths < 1) {
        score -= 10;
        riskFactors.push('New wallet (less than 1 month old)');
      }
    }
  }

  // ========== EXISTING METRICS ==========

  // Transaction history analysis
  if (transfers.length === 0) {
    score -= 20;
    riskFactors.push('No transaction history');
  } else if (transfers.length < 5) {
    score -= 10;
    riskFactors.push('Limited transaction history');
  } else if (transfers.length > 50) {
    positiveFactors.push('Established transaction history');
  }

  if (uniqueInteractions > 20) {
    positiveFactors.push('Diverse wallet interactions');
    score += 5;
  } else if (uniqueInteractions < 3) {
    score -= 15;
    riskFactors.push('Limited address diversity');
  }

  if (largeTransactions > 5) {
    riskFactors.push('Multiple large value transfers');
    score -= 10;
  }

  if (recentActivity > 0) {
    positiveFactors.push('Active in last 30 days');
  } else {
    score -= 5;
    riskFactors.push('No recent activity');
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    totalTransactions: transfers.length,
    uniqueInteractions,
    largeTransactions,
    recentActivity,
    approvalCount,
    approvals,
    sameBlockTxCount,
    newContractInteractions,
    walletAgeMonths,
    riskFactors,
    positiveFactors,
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/10 border-green-500/30';
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
  if (score >= 40) return 'bg-orange-500/10 border-orange-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="fill-none stroke-muted"
          strokeWidth="8"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          className={`fill-none ${score >= 80 ? 'stroke-green-500' : score >= 60 ? 'stroke-yellow-500' : score >= 40 ? 'stroke-orange-500' : 'stroke-red-500'}`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-sm text-muted-foreground">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

export default function SecurityDashboardPage() {
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

  const metrics = useMemo(() => {
    return calculateSecurityMetrics(transfers, address || '');
  }, [transfers, address]);

  if (loading && transfers.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Shield className="h-12 w-12 text-primary animate-pulse" />
        <div className="text-lg text-muted-foreground">Analyzing wallet security...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">No wallet address provided.</p>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to NFT Viewer
          </Link>
        </Button>
        <Badge variant="outline" className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Badge>
      </div>

      {/* Security Score Card */}
      <Card className="glow-effect border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Wallet security analysis based on transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Circle */}
            <div className={`rounded-xl border p-6 ${getScoreBgColor(metrics.score)}`}>
              <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">Security Score</h3>
              <ScoreCircle score={metrics.score} />
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border bg-card p-4 text-center">
                <Activity className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
                <div className="text-xs text-muted-foreground">Total Transactions</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">{metrics.uniqueInteractions}</div>
                <div className="text-xs text-muted-foreground">Unique Addresses</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <Key className={`h-5 w-5 mx-auto mb-2 ${metrics.approvalCount > 5 ? 'text-orange-500' : 'text-green-500'}`} />
                <div className="text-2xl font-bold">{metrics.approvalCount}</div>
                <div className="text-xs text-muted-foreground">Token Approvals</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{metrics.walletAgeMonths}mo</div>
                <div className="text-xs text-muted-foreground">Wallet Age</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">{metrics.largeTransactions}</div>
                <div className="text-xs text-muted-foreground">Large Transfers</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <Bot className={`h-5 w-5 mx-auto mb-2 ${metrics.sameBlockTxCount > 5 ? 'text-orange-500' : 'text-green-500'}`} />
                <div className="text-2xl font-bold">{metrics.sameBlockTxCount}</div>
                <div className="text-xs text-muted-foreground">Same-Block Txs</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <FileCheck className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{metrics.recentActivity}</div>
                <div className="text-xs text-muted-foreground">Recent (30d)</div>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <CheckCircle2 className={`h-5 w-5 mx-auto mb-2 ${metrics.score >= 60 ? 'text-green-500' : 'text-orange-500'}`} />
                <div className="text-2xl font-bold">{metrics.score >= 80 ? 'Low' : metrics.score >= 60 ? 'Med' : 'High'}</div>
                <div className="text-xs text-muted-foreground">Risk Level</div>
              </div>
            </div>
          </div>

          {/* Risk & Positive Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {metrics.riskFactors.length > 0 && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
                <h4 className="font-medium flex items-center gap-2 mb-3 text-orange-500">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {metrics.riskFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {metrics.positiveFactors.length > 0 && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                <h4 className="font-medium flex items-center gap-2 mb-3 text-green-500">
                  <ShieldCheck className="h-4 w-4" />
                  Positive Indicators
                </h4>
                <ul className="space-y-2">
                  {metrics.positiveFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Approvals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Token Approvals ({metrics.approvalCount})
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://etherscan.io/tokenapprovalchecker?search=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Etherscan Approval Checker
              </a>
            </Button>
          </div>
          <CardDescription>
            Review and revoke unnecessary token approvals to protect your assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.approvals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No token approvals detected</p>
              <p className="text-sm mt-1">Your wallet has no active token approvals from transaction history</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 mb-4">
                <p className="text-sm text-orange-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Token approvals allow contracts to spend your tokens. Revoke any you no longer need.
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Approved Spender</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Tx Hash</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.approvals.slice(0, 10).map((approval, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{approval.asset}</TableCell>
                        <TableCell className="font-mono text-sm">
                          <a
                            href={`https://etherscan.io/address/${approval.spender}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {approval.spender.slice(0, 6)}...{approval.spender.slice(-4)}
                          </a>
                        </TableCell>
                        <TableCell>
                          {approval.timestamp
                            ? new Date(approval.timestamp).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <a
                            href={`https://etherscan.io/tx/${approval.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {approval.hash.slice(0, 10)}...
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://etherscan.io/tokenapprovalchecker?search=${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Revoke
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {metrics.approvals.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <a
                      href={`https://etherscan.io/tokenapprovalchecker?search=${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View all {metrics.approvals.length} approvals on Etherscan
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Transaction History
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
                        className="text-primary hover:underline"
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
          {transfers.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No transactions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
