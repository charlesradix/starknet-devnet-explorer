import {
  createSignal,
  createEffect,
  createResource,
  type Accessor,
} from "solid-js";
import type { Account } from "../types.ts";
import { getPredeployedAccounts } from "../lib/rpc.ts";

export function useAccounts(
  url: Accessor<string>,
  connected: Accessor<boolean>,
) {
  const [selected, setSelected] = createSignal<Account>();

  const [accounts] = createResource(
    () => (connected() ? url() : false),
    (u) => getPredeployedAccounts(u as string),
  );

  createEffect(() => {
    if (!connected()) {
      setSelected(undefined);
      return;
    }
    if (selected()) return;
    const list = accounts();
    if (list?.length) setSelected(list[0]);
  });

  return {
    accounts: (): Account[] => (connected() ? (accounts() ?? []) : []),
    selected,
    setSelected,
  };
}
