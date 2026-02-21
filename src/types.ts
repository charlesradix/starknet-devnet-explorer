export type AbiEntry = {
  type: string;
  name: string;
  [key: string]: unknown;
};

export type AbiFunction = {
  type: "function";
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
  state_mutability: "view" | "external";
};

export type ContractInfo = {
  address: string;
  classHash: string;
  abi: AbiEntry[];
  name: string;
};

export type Account = {
  address: string;
  initial_balance?: string;
  private_key?: string;
  public_key?: string;
};

export type TxRecord = {
  hash: string;
  type: string;
  blockNumber: number;
  timestamp: number;
  senderAddress?: string;
  status: string;
};
