import type { AbiEntry, AbiFunction } from "../types.ts";

export function extractContractName(abi: AbiEntry[]): string {
  for (const entry of abi) {
    if (entry.type === "interface") {
      const parts = entry.name.split("::");
      return parts[parts.length - 1];
    }
  }
  return "Unknown";
}

export function getFunctions(abi: AbiEntry[]): AbiFunction[] {
  const fns: AbiFunction[] = [];
  for (const entry of abi) {
    if (entry.type === "function") {
      fns.push(entry as unknown as AbiFunction);
    } else if (entry.type === "interface" && Array.isArray(entry.items)) {
      for (const item of entry.items as AbiEntry[]) {
        if (item.type === "function") fns.push(item as unknown as AbiFunction);
      }
    }
  }
  return fns;
}
