import {
  createSignal,
  createContext,
  useContext,
  type ParentProps,
  type Accessor,
} from "solid-js";
import type { Account, ContractInfo, AbiEntry, TxRecord } from "../types.ts";
import { useHealth } from "../hooks/useHealth.ts";
import { useAccounts } from "../hooks/useAccounts.ts";
import { useContracts } from "../hooks/useContracts.ts";
import { useTxs } from "../hooks/useTxs.ts";
import { callView, callWrite } from "../lib/rpc.ts";

const DEFAULT_URL = "http://localhost:5050";

type AppContextValue = {
  url: Accessor<string>;
  setUrl: (url: string) => void;
  connected: Accessor<boolean>;
  accounts: Accessor<Account[]>;
  selected: Accessor<Account | undefined>;
  setSelected: (a: Account | undefined) => void;
  contracts: Accessor<ContractInfo[]>;
  txs: Accessor<TxRecord[]>;
  read: (
    abi: AbiEntry[],
    address: string,
    fn: string,
    args: Record<string, string>,
  ) => Promise<string[]>;
  write: (
    abi: AbiEntry[],
    address: string,
    fn: string,
    args: Record<string, string>,
  ) => Promise<string>;
};

const AppContext = createContext<AppContextValue>();

export function AppProvider(props: ParentProps) {
  const [url, setUrl] = createSignal(DEFAULT_URL);

  const connected = useHealth(url);
  const { accounts, selected, setSelected } = useAccounts(url, connected);
  const contracts = useContracts(url, connected);
  const txs = useTxs(url, connected);

  const read = (
    abi: AbiEntry[],
    address: string,
    fn: string,
    args: Record<string, string>,
  ) => callView(url(), abi, address, fn, args);

  const write = async (
    abi: AbiEntry[],
    address: string,
    fn: string,
    args: Record<string, string>,
  ) => {
    const account = selected();
    if (!account) throw new Error("No account selected");
    return callWrite(url(), abi, account, address, fn, args);
  };

  return (
    <AppContext.Provider
      value={{
        url,
        setUrl,
        connected,
        accounts,
        selected,
        setSelected,
        contracts,
        txs,
        read,
        write,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
