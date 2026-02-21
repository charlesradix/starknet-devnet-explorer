import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";
import type { AbiEntry, ContractInfo } from "../types.ts";
import { getBlockNumber, getStateUpdate, getClassAt } from "../lib/rpc.ts";
import { extractContractName } from "../lib/abi.ts";

const INTERVAL = 3000;

export function useContracts(
  url: Accessor<string>,
  connected: Accessor<boolean>,
) {
  const [contracts, setContracts] = createSignal<ContractInfo[]>([]);

  createEffect(() => {
    const currentUrl = url();
    if (!connected()) {
      setContracts([]);
      return;
    }

    let lastScanned = -1;

    const scan = async () => {
      try {
        const latest = await getBlockNumber(currentUrl);

        if (latest < lastScanned) {
          setContracts([]);
          lastScanned = -1;
        }

        for (let i = lastScanned + 1; i <= latest; i++) {
          const update = await getStateUpdate(currentUrl, i);
          const deployed = (update as any).state_diff?.deployed_contracts ?? [];

          for (const { address, class_hash } of deployed) {
            try {
              const cls = await getClassAt(currentUrl, address);
              const rawAbi = (cls as any).abi;
              const abi: AbiEntry[] =
                typeof rawAbi === "string"
                  ? JSON.parse(rawAbi)
                  : Array.isArray(rawAbi)
                    ? rawAbi
                    : [];

              const name = extractContractName(abi);
              setContracts((prev) =>
                prev.some((c) => c.address === address)
                  ? prev
                  : [...prev, { address, classHash: class_hash, abi, name }],
              );
            } catch {
              // skip contracts without accessible ABI
            }
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

  return contracts;
}
