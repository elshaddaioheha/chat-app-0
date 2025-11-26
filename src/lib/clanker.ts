// Clanker API integration for token deployment on Base
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export interface TokenDeploymentParams {
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
}

export interface TokenDeploymentResult {
  tokenAddress: string;
  txHash: string;
  explorerUrl: string;
}

const CLANKER_API_URL = 'https://api.clanker.world/deploy';
const CLANKER_CAST_URL = 'https://warpcast.com/~/compose';

// Deploy token via Clanker API
export const deployTokenViaAPI = async (
  params: TokenDeploymentParams,
  apiKey?: string
): Promise<TokenDeploymentResult> => {
  try {
    const response = await fetch(CLANKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API deployment failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      tokenAddress: data.tokenAddress,
      txHash: data.txHash,
      explorerUrl: `https://basescan.org/tx/${data.txHash}`,
    };
  } catch (error) {
    console.error('Clanker API error:', error);
    throw error;
  }
};

// Generate Warpcast cast URL for Farcaster deployment (recommended method)
export const generateCastUrl = (params: TokenDeploymentParams): string => {
  const castText = `@clanker deploy ${params.name} ${params.symbol}${params.description ? ` ${params.description}` : ''}`;
  const encodedText = encodeURIComponent(castText);
  return `${CLANKER_CAST_URL}?text=${encodedText}`;
};

// Deploy token via Farcaster cast (opens Warpcast)
export const deployTokenViaCast = (
  params: TokenDeploymentParams
): { castUrl: string } => {
  const castUrl = generateCastUrl(params);
  window.open(castUrl, '_blank');
  return { castUrl };
};

// Get token info from Base
export const getTokenInfo = async (tokenAddress: `0x${string}`) => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  // ERC20 standard functions
  const name = await publicClient.readContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'name',
  });

  const symbol = await publicClient.readContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'symbol',
  });

  const totalSupply = await publicClient.readContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'totalSupply',
  });

  return {
    address: tokenAddress,
    name,
    symbol,
    totalSupply: totalSupply.toString(),
    explorerUrl: `https://basescan.org/token/${tokenAddress}`,
    dexToolsUrl: `https://www.dextools.io/app/en/base/pair-explorer/${tokenAddress}`,
  };
};

export default {
  deployTokenViaAPI,
  deployTokenViaCast,
  getTokenInfo,
  generateCastUrl,
};
