import {
  Contract,
  Account as StarknetAccount,
  CairoOption,
  CairoOptionVariant,
} from "starknet";
import type { Account, AbiEntry } from "../types.ts";
import { getProvider } from "./provider.ts";
import { getFunctions } from "./abi.ts";

// devnet-specific

export async function ping(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/is_alive`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function getPredeployedAccounts(url: string): Promise<Account[]> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "devnet_getPredeployedAccounts",
      params: { with_balance: true },
    }),
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error.message);
  return data.result as Account[];
}

// standard starknet RPC

export async function getBlockNumber(url: string): Promise<number> {
  return getProvider(url).getBlockNumber();
}

export async function getStateUpdate(url: string, blockNumber: number) {
  return getProvider(url).getStateUpdate(blockNumber);
}

export async function getClassAt(url: string, contractAddress: string) {
  return getProvider(url).getClassAt(contractAddress);
}

export async function getBlockWithReceipts(url: string, blockNumber: number) {
  return getProvider(url).getBlockWithReceipts(blockNumber);
}

// contract interaction — arg parsing

function parseArg(value: string, cairoType?: string): unknown {
  const trimmed = value.trim();

  // Option<T> empty = None, any value = Some(value)
  if (cairoType?.startsWith("core::option::Option")) {
    if (!trimmed) return new CairoOption(CairoOptionVariant.None);
    const innerMatch = cairoType.match(/::<(.+)>$/);
    const inner = parseArg(value, innerMatch?.[1]);
    return new CairoOption(CairoOptionVariant.Some, inner);
  }

  // Type-aware conversions
  if (cairoType === "core::bool") {
    return trimmed === "true" || trimmed === "1" || trimmed === "0x1";
  }
  if (cairoType === "core::integer::u256") {
    try {
      return BigInt(trimmed);
    } catch {}
  }

  // JSON object/array → struct, tuple, etc.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {}
  }

  // Everything else (felt252, ContractAddress, u8,u128, ByteArray):
  // starknet.js handles hex strings and decimal strings via CallData.compile()
  return trimmed;
}

function toArgs(
  abi: AbiEntry[],
  fnName: string,
  args: Record<string, string>,
): any[] {
  const fn = getFunctions(abi).find((f) => f.name === fnName);
  const inputs = fn?.inputs ?? [];
  return inputs.map(({ name, type }) => parseArg(args[name] ?? "", type));
}

// contract interaction result normalization

function normalizeValue(v: unknown): string {
  if (typeof v === "bigint") return "0x" + v.toString(16);
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

export async function callView(
  url: string,
  abi: AbiEntry[],
  contractAddress: string,
  fnName: string,
  args: Record<string, string>,
): Promise<string[]> {
  const contract = new Contract({
    abi: abi as any[],
    address: contractAddress,
    providerOrAccount: getProvider(url),
  });
  const callArgs = toArgs(abi, fnName, args);
  const result = await contract.call(
    fnName,
    callArgs.length ? callArgs : undefined,
  );
  if (Array.isArray(result)) return result.map(normalizeValue);
  if (typeof result === "bigint" || typeof result === "boolean")
    return [normalizeValue(result)];
  if (typeof result === "object" && result !== null) {
    return Object.values(result as Record<string, unknown>).map(normalizeValue);
  }
  return [String(result)];
}

export async function callWrite(
  url: string,
  abi: AbiEntry[],
  account: Account,
  contractAddress: string,
  fnName: string,
  args: Record<string, string>,
): Promise<string> {
  const provider = getProvider(url);
  const signer = new StarknetAccount({
    provider,
    address: account.address,
    signer: account.private_key!,
  });
  const contract = new Contract({
    abi: abi as any[],
    address: contractAddress,
    providerOrAccount: signer,
  });
  const callArgs = toArgs(abi, fnName, args);
  const tx = await contract.invoke(
    fnName,
    callArgs.length ? callArgs : undefined,
  );
  return tx.transaction_hash;
}
