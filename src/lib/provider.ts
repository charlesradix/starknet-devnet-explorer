import { RpcProvider } from "starknet";

let cached: { url: string; provider: RpcProvider } | null = null;

export function getProvider(url: string): RpcProvider {
  if (!cached || cached.url !== url) {
    cached = { url, provider: new RpcProvider({ nodeUrl: url }) };
  }
  return cached.provider;
}
