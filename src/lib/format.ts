export function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortType(type: string): string {
  // core::option::Option::<core::integer::u256> to Option<u256>
  const genericMatch = type.match(/^(.+)::<(.+)>$/);
  if (genericMatch) {
    return `${shortType(genericMatch[1])}<${shortType(genericMatch[2])}>`;
  }
  const parts = type.split("::");
  return parts[parts.length - 1];
}

export function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts * 1000) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatToken(wei: string | undefined, symbol: string): string {
  if (!wei) return "\u2014";
  const value = BigInt(wei);
  const whole = value / 10n ** 18n;
  const frac = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, 2);
  return `${whole}.${frac} ${symbol}`;
}
