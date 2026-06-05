import { ChainhooksClient } from '@hirosystems/chainhooks-client';

const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
const baseUrl = network === 'mainnet' ? 'https://api.mainnet.hiro.so' : 'https://api.testnet.hiro.so';

export const chainhook = new ChainhooksClient({
  baseUrl,
  apiKey: process.env.HIRO_API_KEY,
});

export default chainhook;
