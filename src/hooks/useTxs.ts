import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";
import type { TxRecord } from "../types.ts";
import { getBlockNumber, getBlockWithReceipts } from "../lib/rpc.ts";

const INTERVAL = 3000;

export function useTxs(url: Accessor<string>, connected: Accessor<boolean>) {
  const [txs, setTxs] = createSignal<TxRecord[]>([]);

  createEffect(() => {
    const currentUrl = url();
    if (!connected()) {
      setTxs([]);
      return;
    }

    let lastScanned = -1;

    const scan = async () => {
      try {
        const latest = await getBlockNumber(currentUrl);

        if (latest < lastScanned) {
          setTxs([]);
          lastScanned = -1;
        }

        for (let i = lastScanned + 1; i <= latest; i++) {
          const block = (await getBlockWithReceipts(currentUrl, i)) as any;
          const timestamp: number = block.timestamp ?? 0;
          const newTxs: TxRecord[] = [];

          for (const entry of block.transactions ?? []) {
            const tx = entry.transaction ?? entry;
            const receipt = entry.receipt ?? {};
            newTxs.push({
              hash: receipt.transaction_hash ?? "",
              type: tx.type ?? receipt.type ?? "UNKNOWN",
              blockNumber: i,
              timestamp,
              senderAddress: tx.sender_address,
              status: receipt.execution_status ?? receipt.status ?? "UNKNOWN",
            });
          }

          if (newTxs.length) {
            setTxs((prev) => [...newTxs, ...prev]);
          }

          lastScanned = i;
        }
      } catch {
        // network error, retry next interval
      }
    };

    scan();
    const id = setInterval(scan, INTERVAL);
    onCleanup(() => clearInterval(id));
  });

  return txs;
}
